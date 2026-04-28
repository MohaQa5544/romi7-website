import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { get } from "@vercel/blob";
import { db, schema } from "@/lib/db";

/**
 * Public proxy that streams the image attached to a published announcement.
 *
 * Why: the project's Vercel Blob store is configured as private, so the raw
 * blob URLs are not directly addressable from the browser. The marketing
 * homepage shows pinned announcements to anonymous visitors, so this route
 * deliberately does NOT gate on authentication — any visitor that knows the
 * announcement id can view the image, exactly the same way the announcement
 * itself is publicly viewable on the homepage.
 *
 * If the announcement is unpublished, has no image, or the underlying blob is
 * missing, we return 404 so we never leak metadata.
 */
function contentTypeFromUrl(url: string): string {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  // jpg/jpeg + fallback
  return "image/jpeg";
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const [row] = await db
    .select({
      id: schema.announcements.id,
      isPublished: schema.announcements.isPublished,
      imageUrl: schema.announcements.imageUrl,
    })
    .from(schema.announcements)
    .where(eq(schema.announcements.id, id));

  if (!row || !row.isPublished || !row.imageUrl) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const result = await get(row.imageUrl, { access: "private" });
    if (!result || !result.stream) {
      return NextResponse.json({ error: "missing blob" }, { status: 404 });
    }
    const headers = new Headers();
    headers.set("Content-Type", contentTypeFromUrl(row.imageUrl));
    // Cache for an hour at the CDN edge — admins rarely change images.
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return new Response(result.stream as ReadableStream, { headers });
  } catch (err) {
    console.error("announcement image stream failed:", err);
    return NextResponse.json({ error: "stream failed" }, { status: 502 });
  }
}
