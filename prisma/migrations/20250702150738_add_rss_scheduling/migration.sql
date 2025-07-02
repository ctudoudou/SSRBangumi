-- AlterTable
ALTER TABLE "rss_feeds" ADD COLUMN     "lastChecked" TIMESTAMP(3),
ADD COLUMN     "updateFreq" INTEGER NOT NULL DEFAULT 60;

-- CreateTable
CREATE TABLE "rss_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT NOT NULL,
    "pubDate" TIMESTAMP(3),
    "guid" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "rssFeedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rss_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rss_items_guid_key" ON "rss_items"("guid");

-- AddForeignKey
ALTER TABLE "rss_items" ADD CONSTRAINT "rss_items_rssFeedId_fkey" FOREIGN KEY ("rssFeedId") REFERENCES "rss_feeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
