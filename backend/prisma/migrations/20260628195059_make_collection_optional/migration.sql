-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_collectionId_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "collectionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
