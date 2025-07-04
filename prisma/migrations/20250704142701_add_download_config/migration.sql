-- CreateTable
CREATE TABLE "download_configs" (
    "id" TEXT NOT NULL,
    "rpcUrl" TEXT NOT NULL DEFAULT 'http://localhost:6800/jsonrpc',
    "rpcSecret" TEXT,
    "downloadPath" TEXT NOT NULL DEFAULT '/downloads',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "download_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "download_configs_userId_key" ON "download_configs"("userId");

-- AddForeignKey
ALTER TABLE "download_configs" ADD CONSTRAINT "download_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
