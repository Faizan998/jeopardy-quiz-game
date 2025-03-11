/*
  Warnings:

  - You are about to drop the column `correct` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Question` table. All the data in the column will be lost.
  - The `Token` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `isCorrect` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedIdx` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CorrectIdx` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_userId_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "correct",
DROP COLUMN "text",
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL,
ADD COLUMN     "selectedIdx" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "text",
ADD COLUMN     "CorrectIdx" INTEGER NOT NULL,
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "options" TEXT[],
ADD COLUMN     "value" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalAmount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
DROP COLUMN "Token",
ADD COLUMN     "Token" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
