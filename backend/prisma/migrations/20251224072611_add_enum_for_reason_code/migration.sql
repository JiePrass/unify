/*
  Warnings:

  - Changed the type of `reason_code` on the `CancelEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CancelReasonCode" AS ENUM ('CHANGE_OF_MIND', 'FOUND_OTHER_HELPER', 'NO_LONGER_NEEDED', 'HELPER_NO_RESPONSE', 'HELPER_LATE', 'CANNOT_REACH_LOCATION', 'REQUESTER_NO_SHOW', 'REQUESTER_UNRESPONSIVE', 'TASK_NOT_AS_DESCRIBED', 'TIMEOUT', 'POLICY_VIOLATION');

-- AlterTable
ALTER TABLE "CancelEvent" DROP COLUMN "reason_code",
ADD COLUMN     "reason_code" "CancelReasonCode" NOT NULL;
