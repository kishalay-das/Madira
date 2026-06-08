/**
 * Populates every product with 4 images + a short video, all hosted on Cloudinary.
 *  - cover image = the product's (or its category's) transparent bottle
 *  - + 3 category lifestyle shots (glass / pour / ambiance)
 *  - video = a short ffmpeg slideshow generated from those images
 *
 * Run on the host (reads .env): npx tsx scripts/seed-media.ts
 */
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { promisify } from "node:util";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const exec = promisify(execFile);

// ---- load .env manually (tsx doesn't auto-load it) ----
for (const line of readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
const prisma = new PrismaClient();

const repBottle: Record<string, string> = {
  whiskey: "macallan-rare-cask-25",
  wine: "opus-one-napa",
  champagne: "dom-perignon-vintage",
  vodka: "grey-goose-magnum",
  gin: "monkey-47-gin",
  rum: "diplomatico-reserva",
  tequila: "clase-azul-reposado",
};

const uploadCache = new Map<string, string>();
async function up(path: string, video = false): Promise<string | null> {
  if (!existsSync(path)) return null;
  if (uploadCache.has(path)) return uploadCache.get(path)!;
  const res = await cloudinary.uploader.upload(path, {
    folder: video ? "nocturne/videos" : "nocturne/products",
    resource_type: video ? "video" : "image",
    ...(video
      ? { quality: "auto" }
      : { transformation: [{ quality: "auto", fetch_format: "auto" }] }),
  });
  uploadCache.set(path, res.secure_url);
  return res.secure_url;
}

async function makeVideo(slug: string, files: string[]): Promise<string> {
  const out = `/tmp/nocturne-${slug}.mp4`;
  const L = 1.8,
    X = 0.6;
  const scale =
    "scale=800:800:force_original_aspect_ratio=decrease," +
    "pad=800:800:(ow-iw)/2:(oh-ih)/2:color=0x0b0b0f,setsar=1,fps=30,format=yuv420p";
  const inputs: string[] = [];
  const filters: string[] = [];
  files.forEach((f, i) => {
    inputs.push("-loop", "1", "-t", String(L), "-i", f);
    filters.push(`[${i}:v]${scale}[v${i}]`);
  });
  let last = "[v0]";
  for (let i = 1; i < files.length; i++) {
    const out2 = i === files.length - 1 ? "[vout]" : `[x${i}]`;
    filters.push(
      `${last}[v${i}]xfade=transition=fade:duration=${X}:offset=${(i * (L - X)).toFixed(2)}${out2}`
    );
    last = out2;
  }
  await exec(
    "ffmpeg",
    [
      ...inputs,
      "-filter_complex",
      filters.join(";"),
      "-map",
      files.length > 1 ? "[vout]" : "[v0]",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-y",
      out,
    ],
    { maxBuffer: 1024 * 1024 * 64 }
  );
  return out;
}

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`Processing ${products.length} products…`);

  for (const p of products) {
    const cat = p.category?.slug ?? "";
    const isGift = cat === "gift-boxes";

    // cover bottle
    const ownBottle = `public/bottles/${p.slug}.png`;
    const bottle = existsSync(ownBottle)
      ? ownBottle
      : repBottle[cat]
      ? `public/bottles/${repBottle[cat]}.png`
      : isGift
      ? "public/bottles/life/gift-1.jpg"
      : null;

    // lifestyle pool
    const pool = isGift ? "gift" : cat;
    const life = [1, 2, 3]
      .map((i) => `public/bottles/life/${pool}-${i}.jpg`)
      .filter(existsSync);

    const localImages = [bottle, ...life].filter(Boolean) as string[];
    if (localImages.length < 2) {
      console.log(`  [skip] ${p.slug} (no usable media for "${cat}")`);
      continue;
    }
    // ensure 4 by cycling the lifestyle/bottle if needed
    while (localImages.length < 4) localImages.push(localImages[localImages.length % localImages.length || 0]);
    const four = localImages.slice(0, 4);

    const imageUrls: string[] = [];
    for (const f of four) {
      const u = await up(f);
      if (u) imageUrls.push(u);
    }

    let videoUrl: string | null = null;
    try {
      const mp4 = await makeVideo(p.slug, four);
      videoUrl = await up(mp4, true);
    } catch (e) {
      console.log(`  [video err] ${p.slug}:`, (e as Error).message.slice(0, 120));
    }

    await prisma.product.update({
      where: { id: p.id },
      data: { images: imageUrls, video: videoUrl },
    });
    console.log(`  [ok] ${p.slug}: ${imageUrls.length} imgs${videoUrl ? " + video" : ""}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
