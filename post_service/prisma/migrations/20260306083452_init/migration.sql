/*
  Warnings:

  - You are about to drop the `Comments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[postId,userId]` on the table `Applicant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contribution` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learningGoals` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longTermInterest` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivation` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weeklyCommitmentHours` to the `Applicant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MENTOR', 'APPLICANT');

-- DropForeignKey
ALTER TABLE "Applicant" DROP CONSTRAINT "Applicant_postId_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_postId_fkey";

-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "contribution" TEXT NOT NULL,
ADD COLUMN     "learningGoals" TEXT NOT NULL,
ADD COLUMN     "longTermInterest" BOOLEAN NOT NULL,
ADD COLUMN     "motivation" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'APPLICANT',
ADD COLUMN     "weeklyCommitmentHours" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "applicants" INTEGER[];

-- DropTable
DROP TABLE "Comments";

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_postId_userId_key" ON "Applicant"("postId", "userId");
