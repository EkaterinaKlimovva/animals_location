/*
  Warnings:

  - You are about to drop the column `birth_date` on the `animal` table. All the data in the column will be lost.
  - You are about to drop the column `chip_number` on the `animal` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `animal` table. All the data in the column will be lost.
  - You are about to drop the column `is_alive` on the `animal` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `animal` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `animal` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `animal` table. All the data in the column will be lost.
  - Added the required column `chipper_id` to the `animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chipping_location_id` to the `animal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "animal" DROP CONSTRAINT "animal_owner_id_fkey";

-- DropIndex
DROP INDEX "animal_chip_number_key";

-- AlterTable
ALTER TABLE "animal" DROP COLUMN "birth_date",
DROP COLUMN "chip_number",
DROP COLUMN "created_at",
DROP COLUMN "is_alive",
DROP COLUMN "name",
DROP COLUMN "owner_id",
DROP COLUMN "updated_at",
ADD COLUMN     "chipper_id" INTEGER NOT NULL,
ADD COLUMN     "chipping_date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "chipping_location_id" INTEGER NOT NULL,
ADD COLUMN     "death_date_time" TIMESTAMP(3),
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "lifeStatus" TEXT NOT NULL DEFAULT 'ALIVE',
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_chipper_id_fkey" FOREIGN KEY ("chipper_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_chipping_location_id_fkey" FOREIGN KEY ("chipping_location_id") REFERENCES "location_point"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
