"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";

export type ToggleResult =
  | { ok: true; bookmarked: boolean }
  | { ok: false; error: string };

export async function toggleBookmark(fileId: string): Promise<ToggleResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "يلزم تسجيل الدخول" };

  const userId = session.user.id;

  const [existing] = await db
    .select()
    .from(schema.bookmarks)
    .where(
      and(eq(schema.bookmarks.userId, userId), eq(schema.bookmarks.fileId, fileId)),
    );

  if (existing) {
    await db.delete(schema.bookmarks).where(eq(schema.bookmarks.id, existing.id));
    revalidatePath("/bookmarks");
    return { ok: true, bookmarked: false };
  }

  const [file] = await db
    .select()
    .from(schema.files)
    .where(eq(schema.files.id, fileId));
  if (!file) return { ok: false, error: "الملف غير موجود" };

  await db.insert(schema.bookmarks).values({ userId, fileId });
  db.insert(schema.activityLog)
    .values({ userId, eventType: "bookmark_add", entityId: fileId })
    .catch(() => {});

  revalidatePath("/bookmarks");
  return { ok: true, bookmarked: true };
}
