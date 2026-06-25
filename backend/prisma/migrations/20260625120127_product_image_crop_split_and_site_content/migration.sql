/*
  Warnings:

  - You are about to drop the column `cropHeight` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `cropWidth` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `cropX` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `cropY` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `zoom` on the `ProductImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "cropHeight",
DROP COLUMN "cropWidth",
DROP COLUMN "cropX",
DROP COLUMN "cropY",
DROP COLUMN "zoom",
ADD COLUMN     "desktopCropHeight" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "desktopCropMode" TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN     "desktopCropWidth" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "desktopCropX" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "desktopCropY" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "desktopZoom" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "mobileCropHeight" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "mobileCropMode" TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN     "mobileCropWidth" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "mobileCropX" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "mobileCropY" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "mobileZoom" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_key_key" ON "SiteContent"("key");
