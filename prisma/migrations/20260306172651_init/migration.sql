-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "animal_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_point" (
    "id" SERIAL NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "location_point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER,
    "chip_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "is_alive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_on_type" (
    "animal_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,

    CONSTRAINT "animal_on_type_pkey" PRIMARY KEY ("animal_id","type_id")
);

-- CreateTable
CREATE TABLE "animal_visited_location" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "location_point_id" INTEGER NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_visited_location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "animal_type_name_key" ON "animal_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "animal_chip_number_key" ON "animal"("chip_number");

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_on_type" ADD CONSTRAINT "animal_on_type_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_on_type" ADD CONSTRAINT "animal_on_type_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "animal_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_visited_location" ADD CONSTRAINT "animal_visited_location_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_visited_location" ADD CONSTRAINT "animal_visited_location_location_point_id_fkey" FOREIGN KEY ("location_point_id") REFERENCES "location_point"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
