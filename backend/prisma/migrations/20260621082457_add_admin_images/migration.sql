-- CreateTable
CREATE TABLE "CampaignImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroImage_pkey" PRIMARY KEY ("id")
);
