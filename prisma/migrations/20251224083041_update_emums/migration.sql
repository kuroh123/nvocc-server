/*
  Warnings:

  - The values [PICKUP,DELIVERY,TRANSIT,STORAGE] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.
  - The values [EXPORT,IMPORT,TRANSSHIPMENT] on the enum `ProductType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `qty` on the `tariffs` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('IMPORT', 'EXPORT');
ALTER TABLE "tariffs" ALTER COLUMN "eventType" TYPE "EventType_new" USING ("eventType"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProductType_new" AS ENUM ('HAZ', 'NON_HAZ');
ALTER TABLE "tariffs" ALTER COLUMN "productType" TYPE "ProductType_new" USING ("productType"::text::"ProductType_new");
ALTER TYPE "ProductType" RENAME TO "ProductType_old";
ALTER TYPE "ProductType_new" RENAME TO "ProductType";
DROP TYPE "ProductType_old";
COMMIT;

-- AlterTable
ALTER TABLE "tariffs" DROP COLUMN "qty",
ADD COLUMN     "chargeId" TEXT;

-- AddForeignKey
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "charges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
