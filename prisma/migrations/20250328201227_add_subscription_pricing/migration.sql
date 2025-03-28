/*
  Warnings:

  - Added the required column `baseAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountedPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "baseAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "discountedPrice" DOUBLE PRECISION NOT NULL;
