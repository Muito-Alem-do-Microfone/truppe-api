/*
  Warnings:

  - You are about to drop the `States` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AnnouncementStates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AnnouncementStates" DROP CONSTRAINT "_AnnouncementStates_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnnouncementStates" DROP CONSTRAINT "_AnnouncementStates_B_fkey";

-- DropTable
DROP TABLE "States";

-- DropTable
DROP TABLE "_AnnouncementStates";

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnnoucementState" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AnnoucementState_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- CreateIndex
CREATE INDEX "_AnnoucementState_B_index" ON "_AnnoucementState"("B");

-- AddForeignKey
ALTER TABLE "_AnnoucementState" ADD CONSTRAINT "_AnnoucementState_A_fkey" FOREIGN KEY ("A") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnoucementState" ADD CONSTRAINT "_AnnoucementState_B_fkey" FOREIGN KEY ("B") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;
