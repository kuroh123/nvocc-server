/*
  Warnings:

  - You are about to drop the column `permissions` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the `menus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_menus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "menus" DROP CONSTRAINT "menus_parentId_fkey";

-- DropForeignKey
ALTER TABLE "role_menus" DROP CONSTRAINT "role_menus_menuId_fkey";

-- DropForeignKey
ALTER TABLE "role_menus" DROP CONSTRAINT "role_menus_roleId_fkey";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "permissions";

-- DropTable
DROP TABLE "menus";

-- DropTable
DROP TABLE "role_menus";

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
