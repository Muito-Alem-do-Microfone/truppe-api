-- CreateTable
CREATE TABLE "AnnouncementConfirmation" (
    "id" TEXT NOT NULL,
    "announcementId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementConfirmation_announcementId_key" ON "AnnouncementConfirmation"("announcementId");

-- AddForeignKey
ALTER TABLE "AnnouncementConfirmation" ADD CONSTRAINT "AnnouncementConfirmation_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
