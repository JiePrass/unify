-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_reward_badge_id_fkey";

-- AlterTable
ALTER TABLE "Mission" ALTER COLUMN "reward_badge_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_reward_badge_id_fkey" FOREIGN KEY ("reward_badge_id") REFERENCES "Badge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
