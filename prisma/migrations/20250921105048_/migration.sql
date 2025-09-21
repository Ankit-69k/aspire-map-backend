/*
  Warnings:

  - You are about to drop the column `subjects` on the `Profile` table. All the data in the column will be lost.
  - The `education` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Profile" DROP COLUMN "subjects",
ADD COLUMN     "skills" TEXT[],
DROP COLUMN "education",
ADD COLUMN     "education" TEXT[];
