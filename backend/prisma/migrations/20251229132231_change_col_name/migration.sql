/*
  Warnings:

  - You are about to drop the `CancelEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CancelEvent" DROP CONSTRAINT "CancelEvent_actor_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CancelEvent" DROP CONSTRAINT "CancelEvent_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "CancelEvent" DROP CONSTRAINT "CancelEvent_help_request_id_fkey";

-- DropTable
DROP TABLE "CancelEvent";

-- CreateTable
CREATE TABLE "CancelHelpRequest" (
    "id" SERIAL NOT NULL,
    "help_request_id" INTEGER NOT NULL,
    "assignment_id" INTEGER,
    "actor" "CancelActor" NOT NULL,
    "actor_user_id" INTEGER,
    "stage" "CancelStage" NOT NULL,
    "reason_code" "CancelReasonCode" NOT NULL,
    "reason_text" TEXT,
    "impact_score" INTEGER NOT NULL,
    "violation_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CancelHelpRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CancelHelpRequest" ADD CONSTRAINT "CancelHelpRequest_help_request_id_fkey" FOREIGN KEY ("help_request_id") REFERENCES "HelpRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancelHelpRequest" ADD CONSTRAINT "CancelHelpRequest_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "HelpAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancelHelpRequest" ADD CONSTRAINT "CancelHelpRequest_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
