-- CreateTable
CREATE TABLE "style_configs" (
    "id" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "style_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "style_configs_userId_key" ON "style_configs"("userId");

-- AddForeignKey
ALTER TABLE "style_configs" ADD CONSTRAINT "style_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
