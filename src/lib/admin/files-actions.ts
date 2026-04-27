"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { del, put } from "@vercel/blob";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { extractYoutubeId } from "@/lib/files";

const ALL_FILE_TYPES = [
  "question_bank",
  "answer_key",
  "exam",
  "exam_solution",
  "review",
  "video",
  "mock_exam",
  "mock_exam_solution",
] as const;
type AllFileType = (typeof ALL_FILE_TYPES)[number];
const isMockType = (t: string): boolean =>
  t === "mock_exam" || t === "mock_exam_solution";

const fileMetaInput = z
  .object({
    id: z.string().optional(),
    unitId: z.string().optional(),
    semesterId: z.string().optional(),
    titleAr: z.string().trim().min(2, "العنوان قصير جداً"),
    type: z.enum(ALL_FILE_TYPES),
    examNumber: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === "" || v === null) return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      }),
    isPublished: z.coerce.boolean().optional(),
  })
  .superRefine((d, ctx) => {
    if (isMockType(d.type)) {
      if (!d.semesterId || !d.semesterId.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["semesterId"],
          message: "الفصل الدراسي مطلوب للاختبار التجريبي",
        });
      }
    } else if (!d.unitId || !d.unitId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unitId"],
        message: "الوحدة مطلوبة",
      });
    }
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

  const isMock = isMockType(data.type);
  const finalUnitId = isMock ? null : data.unitId ?? null;
  const finalSemesterId = isMock ? data.semesterId ?? null : null;

  await db
    .update(schema.files)
    .set({
      ...data,
      unitId: finalUnitId,
      semesterId: finalSemesterId,
      updatedAt: new Date(),
    })
    .where(eq(schema.files.id, id));

  revalidatePath("/admin/files");
  revalidatePath("/files");
  if (finalUnitId) revalidatePath(`/unit/${finalUnitId}`);
  return { ok: true };
}

const uploadedInput = z
  .object({
    unitId: z.string().optional().nullable(),
    semesterId: z.string().optional().nullable(),
    titleAr: z.string().trim().min(2),
    type: z.enum(ALL_FILE_TYPES),
    examNumber: z.coerce.number().int().optional().nullable(),
    blobUrl: z.string().url(),
    sizeBytes: z.coerce.number().int().optional().nullable(),
  })
  .superRefine((d, ctx) => {
    if (isMockType(d.type)) {
      if (!d.semesterId || !d.semesterId.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["semesterId"],
          message: "الفصل الدراسي مطلوب",
        });
      }
    } else if (!d.unitId || !d.unitId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unitId"],
        message: "الوحدة مطلوبة",
      });
    }
  });

const videoInput = z.object({
  unitId: z.string().min(1, "الوحدة مطلوبة"),
  titleAr: z.string().trim().min(2, "العنوان قصير جداً"),
  youtubeUrl: z.string().trim().min(5, "رابط يوتيوب مطلوب"),
});

export async function addVideoLesson(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();

  const parsed = videoInput.safeParse({
    unitId: String(fd.get("unitId") ?? ""),
    titleAr: String(fd.get("titleAr") ?? ""),
    youtubeUrl: String(fd.get("youtubeUrl") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const id = extractYoutubeId(parsed.data.youtubeUrl);
  if (!id) {
    return { ok: false, error: "رابط يوتيوب غير صالح — تأكّد من نسخ الرابط كاملاً" };
  }

  try {
    await db.insert(schema.files).values({
      unitId: parsed.data.unitId,
      titleAr: parsed.data.titleAr,
      type: "video",
      source: "youtube",
      path: `https://www.youtube.com/watch?v=${id}`,
      uploadedBy: session.user.id,
    });
    revalidatePath("/admin/files");
    revalidatePath(`/unit/${parsed.data.unitId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "فشل الحفظ" };
  }
}

export async function registerUploadedFile(
  input: z.input<typeof uploadedInput>,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();
  const parsed = uploadedInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const d = parsed.data;
  const isMock = isMockType(d.type);
  const finalUnitId = isMock ? null : d.unitId ?? null;
  const finalSemesterId = isMock ? d.semesterId ?? null : null;
  await db.insert(schema.files).values({
    unitId: finalUnitId,
    semesterId: finalSemesterId,
    titleAr: d.titleAr,
    type: d.type,
    examNumber: d.examNumber ?? undefined,
    source: "blob",
    path: d.blobUrl,
    sizeBytes: d.sizeBytes ?? undefined,
    uploadedBy: session.user.id,
  });
  revalidatePath("/admin/files");
  revalidatePath("/files");
  if (finalUnitId) revalidatePath(`/unit/${finalUnitId}`);
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
  if (file.size > 50 * 1024 * 1024) {
    return { ok: false, error: "الحجم الأقصى 50 ميغا" };
  }
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return { ok: false, error: "ارفع PDF فقط" };
  }

  const unitId = String(fd.get("unitId") ?? "");
  const semesterId = String(fd.get("semesterId") ?? "");
  const titleAr = String(fd.get("titleAr") ?? "").trim();
  const type = String(fd.get("type") ?? "");
  const examNumberRaw = String(fd.get("examNumber") ?? "").trim();

  const parsed = uploadedInput.safeParse({
    unitId,
    semesterId,
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
      access: "private",
      contentType: "application/pdf",
      addRandomSuffix: true,
    });

    const d = parsed.data;
    const isMock = isMockType(d.type);
    const finalUnitId = isMock ? null : d.unitId ?? null;
    const finalSemesterId = isMock ? d.semesterId ?? null : null;
    await db.insert(schema.files).values({
      unitId: finalUnitId,
      semesterId: finalSemesterId,
      titleAr: d.titleAr,
      type: d.type,
      examNumber: d.examNumber ?? undefined,
      source: "blob",
      path: blob.url,
      sizeBytes: file.size,
      uploadedBy: session.user.id,
    });

    revalidatePath("/admin/files");
    revalidatePath("/files");
    if (finalUnitId) revalidatePath(`/unit/${finalUnitId}`);
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
  revalidatePath("/files");
  if (row.unitId) revalidatePath(`/unit/${row.unitId}`);
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
  revalidatePath("/files");
  if (row.unitId) revalidatePath(`/unit/${row.unitId}`);
  return { ok: true };
}
