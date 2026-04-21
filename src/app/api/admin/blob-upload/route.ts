import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth/config";

/**
 * Handles Vercel Blob client uploads. The browser sends a token-exchange
 * request here first; this route verifies the user is an admin and signs
 * a scoped upload token before the client uploads directly to Blob storage.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth();
        if (!session?.user || session.user.role !== "admin") {
          throw new Error("غير مصرّح");
        }
        if (!pathname.toLowerCase().endsWith(".pdf")) {
          throw new Error("صيغة غير مدعومة — ارفع PDF فقط");
        }
        return {
          allowedContentTypes: ["application/pdf"],
          addRandomSuffix: true,
          maximumSizeInBytes: 25 * 1024 * 1024, // 25 MB
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // DB insert happens in the client after upload success (registerUploadedFile),
        // because we need the user's selected metadata (unit, type, title)
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل الرفع";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
