"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

const announcementInput = z.object({
  id: z.string().optional(),
  titleAr: z.string().trim().min(2, "العنوان قصير جداً"),
  bodyAr: z.string().trim().min(2, "النصّ قصير جداً"),
  severity: z.enum(["info", "success", "warning", "urgent"]),
  isPinned: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type AnnouncementFormState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

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
  if (id) {
    await db.update(schema.announcements).set(data).where(eq(schema.announcements.id, id));
  } else {
    await db.insert(schema.announcements).values({ ...data, createdBy: session.user.id });
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
  await db.delete(schema.announcements).where(eq(schema.announcements.id, id));
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/");
  return { ok: true };
}
