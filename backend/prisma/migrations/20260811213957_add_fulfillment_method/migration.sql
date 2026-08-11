-- CreateEnum
CREATE TYPE "FulfillmentMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fulfillmentMethod" "FulfillmentMethod" NOT NULL DEFAULT 'DELIVERY',
ALTER COLUMN "deliveryAddress" DROP NOT NULL;
