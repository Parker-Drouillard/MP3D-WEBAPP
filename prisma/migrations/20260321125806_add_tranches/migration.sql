/*
  Warnings:

  - You are about to drop the `license_slots` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "licenses" ADD COLUMN     "pricePaidCents" INTEGER,
ADD COLUMN     "trancheId" INTEGER;

-- DropTable
DROP TABLE "license_slots";

-- CreateTable
CREATE TABLE "tranches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tranches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tranches_order_key" ON "tranches"("order");

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_trancheId_fkey" FOREIGN KEY ("trancheId") REFERENCES "tranches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
