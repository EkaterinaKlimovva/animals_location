-- DropForeignKey
ALTER TABLE "animals_location"."animal_on_type" DROP CONSTRAINT "animal_on_type_animal_id_fkey";

-- DropForeignKey
ALTER TABLE "animals_location"."animal_visited_location" DROP CONSTRAINT "animal_visited_location_animal_id_fkey";

-- AddForeignKey
ALTER TABLE "animals_location"."animal_on_type" ADD CONSTRAINT "animal_on_type_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals_location"."animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals_location"."animal_visited_location" ADD CONSTRAINT "animal_visited_location_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals_location"."animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
