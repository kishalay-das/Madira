import { NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import { isAdmin } from "@/lib/admin-guard";
import { cloudinary, cloudinaryConfigured } from "@/lib/cloudinary";

// The Cloudinary SDK needs the Node runtime (streams / crypto).
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO = 100 * 1024 * 1024; // 100MB

/**
 * POST /api/admin/upload  (multipart form-data, field "file")
 * Uploads an image or video to Cloudinary and returns the hosted URL.
 * Video is transcoded/compressed by Cloudinary (quality: auto) on upload.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Image hosting is not configured (CLOUDINARY_* env vars)." },
      { status: 500 }
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    /* fall through */
  }
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 422 });
  }

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) {
    return NextResponse.json(
      { error: "Only image or video files are allowed." },
      { status: 415 }
    );
  }
  if (file.size > (isVideo ? MAX_VIDEO : MAX_IMAGE)) {
    return NextResponse.json(
      { error: `File too large (max ${isVideo ? "100MB" : "5MB"}).` },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        isVideo
          ? {
              resource_type: "video",
              folder: "nocturne/videos",
              // compress on ingest: auto-bitrate + faststart for web playback
              quality: "auto",
            }
          : {
              resource_type: "image",
              folder: "nocturne/products",
              transformation: [{ quality: "auto", fetch_format: "auto" }],
            },
        (err, res) => (err || !res ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      resourceType: isVideo ? "video" : "image",
    });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 502 });
  }
}
