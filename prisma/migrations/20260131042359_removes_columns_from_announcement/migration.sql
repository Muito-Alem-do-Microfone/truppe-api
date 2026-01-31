/*
  Warnings:

  - You are about to drop the column `about` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Announcement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "about",
DROP COLUMN "age",
DROP COLUMN "email",
DROP COLUMN "number",
DROP COLUMN "title",
ALTER COLUMN "name" DROP NOT NULL;
