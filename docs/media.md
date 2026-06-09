# Media — Images, Video & the Bottle Renderer

Nocturne uses three layers of product visuals:

1. **Procedural SVG bottle** — always available, generated from each product's palette.
2. **Uploaded photos** — up to four Cloudinary images per product (`Product.images String[]`).
3. **Product video** — one optional Cloudinary video (`Product.video String? @db.Text`).

## Procedural bottle (`src/components/bottle.tsx`)

Every product carries three hex colors — `paletteGlass`, `paletteLiquid`, `paletteLabel` — that
deterministically render a vector bottle. It needs no network request, so it's used as the catalog
thumbnail, cart‑drawer thumbnail, and the gallery fallback when a product has no uploaded media.

## Cloudinary

Configured in `src/lib/cloudinary.ts` from three env vars (server‑only):

```ts
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
```

`cloudinaryConfigured()` guards features that need media hosting and returns a clear error when the
keys are missing, instead of crashing.

> Required env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
> See [configuration.md](configuration.md).

## Admin upload — `POST /api/admin/upload`

The admin console uploads media through this Node‑runtime route
(`src/app/api/admin/upload/route.ts`):

- **Auth:** admin only (`isAdmin()` → `403` otherwise).
- **Input:** `multipart/form-data` with a `file` field.
- **Accepts:** images and videos only (`415` for anything else).
- **Limits in the handler:** images ≤ **5 MB**, videos ≤ **100 MB** (`413` over the limit).
- **Runtime:** `runtime = "nodejs"`, `maxDuration = 60` (the Cloudinary SDK needs Node streams/crypto).
- **Processing:** streamed to `cloudinary.uploader.upload_stream` with `quality: auto` so Cloudinary
  transcodes/compresses on upload. Returns the hosted secure URL, which the editor stores in
  `images[]` or `video`.

### ⚠️ Production limit on Vercel

Vercel serverless functions cap the **request body at 4.5 MB**. Even though the handler allows up
to 100 MB videos / 5 MB images, in production an upload routed through this function will be rejected
by the platform once the body exceeds **4.5 MB**. For large media:

- Upload **directly from the browser to Cloudinary** (signed/unsigned upload), then send only the
  resulting URL to the app — bypassing the function body limit entirely; **or**
- Keep proxying small images through `/api/admin/upload` and use direct upload only for video.

This works fine locally and in Docker (no 4.5 MB cap), so the limitation is Vercel‑specific.

## Bulk media seeding — `scripts/seed-media.ts`

Populates **every** product with 4 images + a generated video, all on Cloudinary. Run on the host
(it reads `.env` manually since `tsx` doesn't auto‑load it):

```bash
npx tsx scripts/seed-media.ts
```

What it does per product:

1. **Cover image** = the product's (or its category's representative) transparent bottle.
2. **+3 lifestyle shots** for the category (glass / pour / ambiance).
3. **Video** = a short slideshow generated from those images with **ffmpeg**, then uploaded.
4. Writes the four image URLs into `images[]` and the video URL into `video`.

> Requires **ffmpeg** installed on the host and valid Cloudinary credentials in `.env`.

## Gallery & magnifier (`src/components/product/product-detail.tsx`)

The product detail gallery cycles the uploaded images and the video. Notable behavior:

- **`object-contain`** so transparent bottle PNGs and full‑bleed lifestyle photos both display
  completely (no cropping), with magnifier math aligned to the contained image.
- **Hover magnifier** for a zoomed view of the active photo.
- **Video** is offered alongside the stills when `Product.video` is set.
- **Fallback** to the procedural `<Bottle>` when a product has no uploaded media.
