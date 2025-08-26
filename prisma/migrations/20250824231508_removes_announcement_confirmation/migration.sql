/*
  Warnings:

  - You are about to drop the column `status` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the `AnnouncementConfirmation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AnnouncementConfirmation" DROP CONSTRAINT "AnnouncementConfirmation_announcementId_fkey";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "status";

-- DropTable
DROP TABLE "AnnouncementConfirmation";

-- DropEnum
DROP TYPE "AnnouncementStatus";
