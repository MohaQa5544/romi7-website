import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { getFileUrl } from "@/lib/files";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await ctx.params;
  const session = await auth();

  const [file] = await db.select().from(schema.files).where(eq(schema.files.id, fileId));
  if (!file || !file.isPublished) {
    return NextResponse.json({ error: "الملف غير متاح" }, { status: 404 });
  }

  // Increment + log (fire-and-forget)
  db
    .update(schema.files)
    .set({ downloadCount: sql`${schema.files.downloadCount} + 1` })
    .where(eq(schema.files.id, fileId))
    .catch(() => {});

  if (session?.user) {
    db
      .insert(schema.activityLog)
      .values({
        userId: session.user.id,
        eventType: "file_download",
        entityId: fileId,
      })
      .catch(() => {});
  }

  const target = getFileUrl(file);
  const absolute = target.startsWith("http")
    ? target
    : new URL(target, req.url).toString();

  return NextResponse.redirect(absolute, 302);
}
