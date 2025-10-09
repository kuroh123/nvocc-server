/*
  Warnings:

  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PortType" AS ENUM ('DRY_PORT', 'SEA_PORT');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "codeChar2" TEXT NOT NULL,
    "codeChar3" TEXT NOT NULL,
    "unRegion" TEXT,
    "unSubregion" TEXT,
    "currencyId" TEXT,
    "invoiceRoundOff" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "portType" "PortType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "countryId" TEXT NOT NULL,
    "itaCode" TEXT,
    "portCode" TEXT,
    "customsDetails" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "portId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terminals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_codeChar2_key" ON "countries"("codeChar2");

-- CreateIndex
CREATE UNIQUE INDEX "countries_codeChar3_key" ON "countries"("codeChar3");

-- CreateIndex
CREATE UNIQUE INDEX "terminals_name_key" ON "terminals"("name");

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_portId_fkey" FOREIGN KEY ("portId") REFERENCES "ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
