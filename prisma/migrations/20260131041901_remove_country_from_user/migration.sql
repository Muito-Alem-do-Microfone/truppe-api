/*
  Warnings:

  - You are about to drop the column `country` on the `AppUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppUser" DROP COLUMN "country",
ADD COLUMN     "city" TEXT;
