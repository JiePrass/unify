-- AddForeignKey
ALTER TABLE "CancelHelpRequest" ADD CONSTRAINT "CancelHelpRequest_penalty_executed_by_fkey" FOREIGN KEY ("penalty_executed_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
