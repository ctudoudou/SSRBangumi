-- CreateTable
CREATE TABLE "ai_configs" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT,
    "proxyUrl" TEXT DEFAULT 'https://openrouter.ai/api/v1',
    "model" TEXT DEFAULT 'anthropic/claude-3.5-sonnet',
    "smartTorrentRecognition" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_configs_userId_key" ON "ai_configs"("userId");

-- AddForeignKey
ALTER TABLE "ai_configs" ADD CONSTRAINT "ai_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
