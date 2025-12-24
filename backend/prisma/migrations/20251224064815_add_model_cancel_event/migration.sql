-- CreateEnum
CREATE TYPE "CancelActor" AS ENUM ('REQUESTER', 'HELPER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CancelStage" AS ENUM ('BEFORE_TAKEN', 'AFTER_TAKEN', 'AFTER_CONFIRMED');

-- CreateTable
CREATE TABLE "CancelEvent" (
    "id" SERIAL NOT NULL,
    "help_request_id" INTEGER NOT NULL,
    "assignment_id" INTEGER,
    "actor" "CancelActor" NOT NULL,
    "actor_user_id" INTEGER,
    "stage" "CancelStage" NOT NULL,
    "reason_code" VARCHAR(50) NOT NULL,
    "reason_text" TEXT,
    "impact_score" INTEGER NOT NULL,
    "violation_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CancelEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CancelEvent" ADD CONSTRAINT "CancelEvent_help_request_id_fkey" FOREIGN KEY ("help_request_id") REFERENCES "HelpRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancelEvent" ADD CONSTRAINT "CancelEvent_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "HelpAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancelEvent" ADD CONSTRAINT "CancelEvent_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
