-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "animals_location";

-- CreateTable
CREATE TABLE "animals_location"."account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals_location"."animal_type" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "animal_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals_location"."location_point" (
    "id" SERIAL NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "location_point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals_location"."animal" (
    "id" SERIAL NOT NULL,
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "gender" TEXT NOT NULL,
    "lifeStatus" TEXT NOT NULL DEFAULT 'ALIVE',
    "chipping_date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chipper_id" INTEGER,
    "chipping_location_id" INTEGER NOT NULL,
    "death_date_time" TIMESTAMP(3),

    CONSTRAINT "animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals_location"."animal_on_type" (
    "animal_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,

    CONSTRAINT "animal_on_type_pkey" PRIMARY KEY ("animal_id","type_id")
);

-- CreateTable
CREATE TABLE "animals_location"."animal_visited_location" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "location_point_id" INTEGER NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_visited_location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "animals_location"."account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "animal_type_type_key" ON "animals_location"."animal_type"("type");

-- CreateIndex
CREATE UNIQUE INDEX "location_point_latitude_longitude_key" ON "animals_location"."location_point"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "animals_location"."animal" ADD CONSTRAINT "animal_chipper_id_fkey" FOREIGN KEY ("chipper_id") REFERENCES "animals_location"."account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals_location"."animal" ADD CONSTRAINT "animal_chipping_location_id_fkey" FOREIGN KEY ("chipping_location_id") REFERENCES "animals_location"."location_point"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals_location"."animal_on_type" ADD CONSTRAINT "animal_on_type_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals_location"."animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals_location"."animal_on_type" ADD CONSTRAINT "animal_on_type_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "animals_location"."animal_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals_location"."animal_visited_location" ADD CONSTRAINT "animal_visited_location_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals_location"."animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals_location"."animal_visited_location" ADD CONSTRAINT "animal_visited_location_location_point_id_fkey" FOREIGN KEY ("location_point_id") REFERENCES "animals_location"."location_point"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
