-- Premium ↔ Standard storefront segmentation
ALTER TABLE "Product" ADD COLUMN "segment" TEXT NOT NULL DEFAULT 'PREMIUM';
CREATE INDEX "Product_segment_idx" ON "Product"("segment");
