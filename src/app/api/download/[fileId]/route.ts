import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { get } from "@vercel/blob";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";

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

  // Require a logged-in user to access study content
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url), 302);
  }

  const urlObj = new URL(req.url);
  const isPreview = urlObj.searchParams.get("preview") === "1";

  // Log activity — downloads only, not previews (avoid inflating counts)
  if (!isPreview) {
    db
      .update(schema.files)
      .set({ downloadCount: sql`${schema.files.downloadCount} + 1` })
      .where(eq(schema.files.id, fileId))
      .catch(() => {});
    db
      .insert(schema.activityLog)
      .values({
        userId: session.user.id,
        eventType: "file_download",
        entityId: fileId,
      })
      .catch(() => {});
  }

  // repo sources → serve from /public via redirect
  if (file.source === "repo") {
    const target = file.path.startsWith("/") ? file.path : `/${file.path}`;
    return NextResponse.redirect(new URL(target, req.url).toString(), 302);
  }

  // blob sources → fetch from Vercel Blob (private) and stream back
  try {
    const result = await get(file.path, { access: "private" });
    if (!result || !result.stream) {
      return NextResponse.json({ error: "تعذّر قراءة الملف" }, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    if (file.sizeBytes) headers.set("Content-Length", String(file.sizeBytes));
    headers.set(
      "Content-Disposition",
      `${isPreview ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(
        `${file.titleAr}.pdf`,
      )}`,
    );
    // Small cache for previews so re-opening the same file is quick
    headers.set("Cache-Control", "private, max-age=300");

    return new Response(result.stream as ReadableStream, { headers });
  } catch (err) {
    console.error("blob stream failed:", err);
    return NextResponse.json({ error: "تعذّر تحميل الملف" }, { status: 502 });
  }
}
