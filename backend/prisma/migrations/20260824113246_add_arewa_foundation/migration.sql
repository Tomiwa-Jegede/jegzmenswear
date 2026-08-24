-- CreateTable
CREATE TABLE "ArewaConversation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArewaConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArewaMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArewaMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArewaConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Arewa',
    "greeting" TEXT NOT NULL DEFAULT 'Hi, I''m Arewa 👋🏽 Welcome to Jegz Menswear. What are we dressing you for today?',
    "personality" TEXT NOT NULL DEFAULT 'Warm, confident, fashion-aware, friendly, intelligent, conversational, slightly playful, sophisticated. Never pushy, never robotic.',
    "recommendedOccasions" JSONB NOT NULL DEFAULT '[]',
    "priceRangeMin" DECIMAL(10,2),
    "priceRangeMax" DECIMAL(10,2),
    "featuredProductIds" JSONB NOT NULL DEFAULT '[]',
    "excludedProductIds" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArewaConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArewaEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArewaEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArewaConversation_sessionId_key" ON "ArewaConversation"("sessionId");

-- AddForeignKey
ALTER TABLE "ArewaMessage" ADD CONSTRAINT "ArewaMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ArewaConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
