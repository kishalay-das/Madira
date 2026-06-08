-- Replace single product image with an images array (up to 5)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "image";
ALTER TABLE "Product" ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
