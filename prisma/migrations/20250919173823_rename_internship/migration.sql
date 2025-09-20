/*
  Warnings:

  - You are about to drop the column `internships` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Profile" DROP COLUMN "internships",
ADD COLUMN     "experience" TEXT[];
