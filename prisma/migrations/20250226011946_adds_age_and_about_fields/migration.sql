/*
  Warnings:

  - Added the required column `about` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "about" TEXT NOT NULL,
ADD COLUMN     "age" INTEGER NOT NULL;
