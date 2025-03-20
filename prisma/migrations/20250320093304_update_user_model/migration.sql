/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `category` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_categoryId_fkey";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "totalAmount" SET DATA TYPE INTEGER;
