"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { del, put } from "@vercel/blob";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

const announcementInput = z.object({
  id: z.string().optional(),
  titleAr: z.string().trim().min(2, "العنوان قصير جداً"),
  bodyAr: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  severity: z.enum(["info", "success", "warning", "urgent"]),
  isPinned: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type AnnouncementFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

/**
 * Best-effort deletion of a previously stored Vercel Blob image.
 * Failures are swallowed so a stale blob never blocks the DB write.
 */
async function safeDeleteBlob(url: string | null | undefined) {
  if (!url) return;
  try {
    await del(url);
  } catch (err) {
    console.warn("Failed to delete announcement image blob:", err);
  }
}

export async function saveAnnouncement(
  _prev: AnnouncementFormState,
  fd: FormData,
): Promise<AnnouncementFormState> {
  const session = await requireAdmin();
  const raw = Object.fromEntries(fd.entries());
  const parsed = announcementInput.safeParse({
    ...raw,
    isPinned: raw.isPinned === "on" || raw.isPinned === "true",
    isPublished: raw.isPublished === "on" || raw.isPublished === "true",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const { id, ...data } = parsed.data;

  // --- Image handling -------------------------------------------------------
  const image = fd.get("image");
  const removeImage = fd.get("removeImage") === "on" || fd.get("removeImage") === "true";

  // Look up the current row for edits — needed so we can clean up the old blob
  // when the admin replaces or removes the image.
  const existing = id
    ? (
        await db
          .select()
          .from(schema.announcements)
          .where(eq(schema.announcements.id, id))
      )[0]
    : null;

  let imageUrl: string | null = existing?.imageUrl ?? null;

  if (image instanceof File && image.size > 0) {
    if (!ALLOWED_IMAGE_MIME.has(image.type)) {
      return { ok: false, error: "صيغة الصورة غير مدعومة (JPG, PNG, WebP, GIF فقط)" };
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return { ok: false, error: "حجم الصورة الأقصى 8 ميغا" };
    }
    try {
      const safeName = image.name.replace(/[^\w؀-ۿ.\-]+/g, "_") || "image";
      // The Vercel Blob store on this project is configured as private,
      // so we upload privately and serve the image through a public proxy
      // route at /api/announcement-image/[id] which streams from the blob.
      const blob = await put(`announcements/${Date.now()}-${safeName}`, image, {
        access: "private",
        contentType: image.type,
        addRandomSuffix: true,
      });
      // Replace: drop the old blob if there was one
      await safeDeleteBlob(existing?.imageUrl);
      imageUrl = blob.url;
    } catch (err) {
      console.error("Announcement image upload failed:", err);
      return {
        ok: false,
        error: err instanceof Error ? err.message : "فشل رفع الصورة",
      };
    }
  } else if (removeImage) {
    await safeDeleteBlob(existing?.imageUrl);
    imageUrl = null;
  }

  // An announcement must have SOMETHING to show — text or image.
  if (!data.bodyAr && !imageUrl) {
    return {
      ok: false,
      error: "أضف نصّاً للإعلان أو صورة (أو كليهما)",
    };
  }

  if (id) {
    await db
      .update(schema.announcements)
      .set({ ...data, imageUrl })
      .where(eq(schema.announcements.id, id));
  } else {
    await db
      .insert(schema.announcements)
      .values({ ...data, imageUrl, createdBy: session.user.id });
  }
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { ok: true };
}

export async function togglePinAnnouncement(id: string): Promise<void> {
  await requireAdmin();
  const [row] = await db
    .select()
    .from(schema.announcements)
    .where(eq(schema.announcements.id, id));
  if (!row) return;
  await db
    .update(schema.announcements)
    .set({ isPinned: !row.isPinned })
    .where(eq(schema.announcements.id, id));
  revalidatePath("/admin/announcements");
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function toggleAnnouncementPublished(id: string): Promise<void> {
  await requireAdmin();
  const [row] = await db
    .select()
    .from(schema.announcements)
    .where(eq(schema.announcements.id, id));
  if (!row) return;
  await db
    .update(schema.announcements)
    .set({ isPublished: !row.isPublished })
    .where(eq(schema.announcements.id, id));
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function deleteAnnouncement(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const [row] = await db
    .select()
    .from(schema.announcements)
    .where(eq(schema.announcements.id, id));
  if (row?.imageUrl) await safeDeleteBlob(row.imageUrl);
  await db.delete(schema.announcements).where(eq(schema.announcements.id, id));
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");
  return { ok: true };
}
