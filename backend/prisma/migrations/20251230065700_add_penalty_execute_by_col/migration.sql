-- AlterTable
ALTER TABLE "CancelHelpRequest" ADD COLUMN     "penalty_executed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "penalty_executed_at" TIMESTAMP(3),
ADD COLUMN     "penalty_executed_by" INTEGER;
