"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { del, put } from "@vercel/blob";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

const fileMetaInput = z.object({
  id: z.string().optional(),
  unitId: z.string().min(1, "الوحدة مطلوبة"),
  titleAr: z.string().trim().min(2, "العنوان قصير جداً"),
  type: z.enum(["question_bank", "answer_key", "exam", "exam_solution"]),
  examNumber: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "" || v === null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }),
  isPublished: z.coerce.boolean().optional(),
});

export type FileFormState = { ok: true } | { ok: false; error: string } | null;

export async function saveFileMeta(
  _prev: FileFormState,
  fd: FormData,
): Promise<FileFormState> {
  await requireAdmin();
  const raw = Object.fromEntries(fd.entries());
  const parsed = fileMetaInput.safeParse({
    ...raw,
    isPublished: raw.isPublished === "on" || raw.isPublished === "true",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const { id, ...data } = parsed.data;
  if (!id) {
    return { ok: false, error: "لا يمكن إنشاء ملف بدون مسار — استخدم زرّ الرفع" };
  }

  await db
    .update(schema.files)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.files.id, id));

  revalidatePath("/admin/files");
  revalidatePath(`/unit/${data.unitId}`);
  return { ok: true };
}

const uploadedInput = z.object({
  unitId: z.string().min(1),
  titleAr: z.string().trim().min(2),
  type: z.enum(["question_bank", "answer_key", "exam", "exam_solution"]),
  examNumber: z.coerce.number().int().optional().nullable(),
  blobUrl: z.string().url(),
  sizeBytes: z.coerce.number().int().optional().nullable(),
});

export async function registerUploadedFile(
  input: z.input<typeof uploadedInput>,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();
  const parsed = uploadedInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const d = parsed.data;
  await db.insert(schema.files).values({
    unitId: d.unitId,
    titleAr: d.titleAr,
    type: d.type,
    examNumber: d.examNumber ?? undefined,
    source: "blob",
    path: d.blobUrl,
    sizeBytes: d.sizeBytes ?? undefined,
    uploadedBy: session.user.id,
  });
  revalidatePath("/admin/files");
  revalidatePath(`/unit/${d.unitId}`);
  return { ok: true };
}

/**
 * Direct server-action upload: accepts the file in FormData, streams it
 * straight to Vercel Blob, and inserts the DB row. Replaces the previous
 * client-upload + webhook flow which was unreliable. Capped at 25MB via
 * next.config `serverActions.bodySizeLimit`.
 */
export async function uploadFile(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();

  const file = fd.get("file");
  if (!(file instanceof File)) return { ok: false, error: "اختر ملف PDF" };
  if (file.size === 0) return { ok: false, error: "الملف فارغ" };
  if (file.size > 25 * 1024 * 1024) {
    return { ok: false, error: "الحجم الأقصى 25 ميغا" };
  }
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return { ok: false, error: "ارفع PDF فقط" };
  }

  const unitId = String(fd.get("unitId") ?? "");
  const titleAr = String(fd.get("titleAr") ?? "").trim();
  const type = String(fd.get("type") ?? "");
  const examNumberRaw = String(fd.get("examNumber") ?? "").trim();

  const parsed = uploadedInput.safeParse({
    unitId,
    titleAr,
    type,
    examNumber: examNumberRaw || null,
    blobUrl: "https://placeholder/x.pdf", // replaced after put()
    sizeBytes: file.size,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  try {
    // Sanitize filename: strip path separators, keep basename, random suffix via addRandomSuffix
    const safeName = file.name.replace(/[^\w\u0600-\u06FF.\-]+/g, "_");
    const blob = await put(`admin/${Date.now()}-${safeName}`, file, {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: true,
    });

    const d = parsed.data;
    await db.insert(schema.files).values({
      unitId: d.unitId,
      titleAr: d.titleAr,
      type: d.type,
      examNumber: d.examNumber ?? undefined,
      source: "blob",
      path: blob.url,
      sizeBytes: file.size,
      uploadedBy: session.user.id,
    });

    revalidatePath("/admin/files");
    revalidatePath(`/unit/${d.unitId}`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل الرفع";
    console.error("uploadFile failed:", err);
    return { ok: false, error: `فشل الرفع: ${message}` };
  }
}

export async function toggleFilePublished(id: string): Promise<void> {
  await requireAdmin();
  const [row] = await db.select().from(schema.files).where(eq(schema.files.id, id));
  if (!row) return;
  await db
    .update(schema.files)
    .set({ isPublished: !row.isPublished, updatedAt: new Date() })
    .where(eq(schema.files.id, id));
  revalidatePath("/admin/files");
  revalidatePath(`/unit/${row.unitId}`);
}

export async function deleteFile(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const [row] = await db.select().from(schema.files).where(eq(schema.files.id, id));
  if (!row) return { ok: false, error: "الملف غير موجود" };

  if (row.source === "blob") {
    try {
      await del(row.path);
    } catch (err) {
      console.error("Failed to delete blob:", err);
    }
  }

  await db.delete(schema.files).where(eq(schema.files.id, id));
  revalidatePath("/admin/files");
  revalidatePath(`/unit/${row.unitId}`);
  return { ok: true };
}
