-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "currentGame" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "AssessmentGame" ADD COLUMN     "handwritingImageUrl" TEXT;
