/*
  Warnings:

  - Added the required column `name` to the `Upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Upload` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_portId_fkey";

-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_terminalId_fkey";

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "agentId" TEXT,
ADD COLUMN     "depotId" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_portId_fkey" FOREIGN KEY ("portId") REFERENCES "ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "depots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
