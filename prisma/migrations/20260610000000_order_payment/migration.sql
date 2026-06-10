-- Add payment method + cash-on-delivery surcharge to orders
ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'card';
ALTER TABLE "Order" ADD COLUMN "codFee" DECIMAL(10,2) NOT NULL DEFAULT 0;
