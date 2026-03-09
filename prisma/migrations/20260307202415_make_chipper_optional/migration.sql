-- DropForeignKey
ALTER TABLE "animal" DROP CONSTRAINT "animal_chipper_id_fkey";

-- AlterTable
ALTER TABLE "animal" ALTER COLUMN "chipper_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_chipper_id_fkey" FOREIGN KEY ("chipper_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
