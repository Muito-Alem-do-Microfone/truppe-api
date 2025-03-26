-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "status" "AnnouncementStatus" NOT NULL DEFAULT 'PENDING';
