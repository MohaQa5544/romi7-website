import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "@/lib/auth/admin";

/**
 * Token broker for direct browser → Vercel Blob uploads.
 *
 * Vercel's serverless functions cap request bodies at ~4.5MB, so the previous
 * "FormData → server action → put()" path fails for any PDF over that size
 * with an opaque "An unexpected response was received from the server" error.
 *
 * The client upload pattern asks this route for a short-lived signed token,
 * then PUTs the file straight to the Vercel Blob storage endpoint, never
 * touching our serverless function with the file body. After the upload
 * finishes, the client calls the `registerUploadedFile` server action with
 * just the resulting blob URL + small metadata payload (well under the
 * limit) to insert the DB row.
 *
 * This endpoint is admin-only — `requireAdmin` runs inside
 * `onBeforeGenerateToken`, which is the spot Vercel guarantees runs before
 * any token is issued.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        await requireAdmin();
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No-op: the client also calls `registerUploadedFile` directly
        // with the blob URL once the upload finishes, so the DB row is
        // created there — we don't need this webhook to run on localhost
        // (where Vercel can't reach it anyway).
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "فشل إصدار الرمز" },
      { status: 400 },
    );
  }
}
