-- CreateTable
CREATE TABLE "read_later" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "read_later_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "read_later_userId_newsId_key" ON "read_later"("userId", "newsId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_newsId_key" ON "favorites"("userId", "newsId");

-- AddForeignKey
ALTER TABLE "read_later" ADD CONSTRAINT "read_later_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_later" ADD CONSTRAINT "read_later_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;
