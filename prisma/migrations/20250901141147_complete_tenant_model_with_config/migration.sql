/*
  Warnings:

  - Added the required column `tenantId` to the `users` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "app_abbr" TEXT NOT NULL,
    "website_url" TEXT,
    "email" TEXT NOT NULL,
    "activation" BOOLEAN NOT NULL DEFAULT true,
    "resend_activation_threshold" INTEGER NOT NULL DEFAULT 3,
    "language" TEXT NOT NULL DEFAULT 'en',
    "template" TEXT NOT NULL DEFAULT 'default',
    "app_version" TEXT NOT NULL DEFAULT '1.0.0',
    "app_status" TEXT NOT NULL DEFAULT 'active',
    "app_msg" TEXT,
    "prefix_booking" TEXT NOT NULL DEFAULT 'BKG',
    "prefix_bl" TEXT NOT NULL DEFAULT 'BL',
    "password_expiry_days" INTEGER NOT NULL DEFAULT 90,
    "max_user_sessions" INTEGER NOT NULL DEFAULT 5,
    "booking_confirmation_text" TEXT,
    "currency_converter_api_key" TEXT,
    "audit_trail_anyoperation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_app_abbr_key" ON "tenants"("app_abbr");

-- Insert a default tenant for existing users
INSERT INTO "tenants" ("id", "name", "app_abbr", "email", "updatedAt") 
VALUES ('default-tenant-id', 'Default Tenant', 'DEFAULT', 'admin@defaulttenant.com', CURRENT_TIMESTAMP);

-- AlterTable - Add tenantId column with default value first
ALTER TABLE "users" ADD COLUMN "tenantId" TEXT DEFAULT 'default-tenant-id';

-- Update all existing users to use the default tenant
UPDATE "users" SET "tenantId" = 'default-tenant-id' WHERE "tenantId" IS NULL;

-- Now make the column required (remove default)
ALTER TABLE "users" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "tenantId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
