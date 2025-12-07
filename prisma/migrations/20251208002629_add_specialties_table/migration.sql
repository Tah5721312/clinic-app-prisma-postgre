-- CreateTable
CREATE TABLE "specialties" (
    "specialty_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("specialty_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialties_name_key" ON "specialties"("name");

-- CreateIndex
CREATE INDEX "specialties_name_idx" ON "specialties"("name");

