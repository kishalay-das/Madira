-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "deliveryAccuracy" DOUBLE PRECISION,
ADD COLUMN     "deliveryLat" DOUBLE PRECISION,
ADD COLUMN     "deliveryLng" DOUBLE PRECISION;
