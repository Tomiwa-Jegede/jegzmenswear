/*
  Warnings:

  - You are about to drop the column `amount` on the `DiscountCode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DiscountCode" DROP COLUMN "amount",
ADD COLUMN     "percentage" DECIMAL(5,2) NOT NULL DEFAULT 10;
