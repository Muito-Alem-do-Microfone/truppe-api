/*
  Warnings:

  - Added the required column `type` to the `Instrument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instrument" ADD COLUMN     "type" TEXT NOT NULL;
