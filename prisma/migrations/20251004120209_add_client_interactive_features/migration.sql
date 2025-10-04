/*
  Warnings:

  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `contacts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `prescription_categories` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `prescription_categories` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `prescription_documents` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `prescription_documents` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `project_files` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `project_files` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `resource_library` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `resource_library` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `resource_library` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `space_files` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `space_files` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `spaces` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `spaces` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `brands` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `prescription_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `prescription_documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `project_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `resource_library` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `resource_library` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `space_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `spaces` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('INTERIEUR', 'EXTERIEUR');

-- CreateEnum
CREATE TYPE "FavoriteStatus" AS ENUM ('PAS_OK', 'OK', 'J_ADORE');

-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_created_by_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "resource_library" DROP CONSTRAINT "resource_library_created_by_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "brands" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "contacts" DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "prescription_categories" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "prescription_documents" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "project_files" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "resource_library" DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "sub_category_2_id" TEXT,
ADD COLUMN     "type" "ResourceType" DEFAULT 'INTERIEUR',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "space_files" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "spaces" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "sub_categories_2" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sub_category_1_id" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_categories_2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "status" "FavoriteStatus" NOT NULL DEFAULT 'OK',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_categories_1" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_categories_1_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_2_sub_category_1_id_name_key" ON "sub_categories_2"("sub_category_1_id", "name");

-- CreateIndex
CREATE INDEX "user_favorites_resource_id_idx" ON "user_favorites"("resource_id");

-- CreateIndex
CREATE INDEX "user_favorites_user_id_idx" ON "user_favorites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_user_id_resource_id_key" ON "user_favorites"("user_id", "resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "parent_categories_name_key" ON "parent_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_1_parent_id_name_key" ON "sub_categories_1"("parent_id", "name");

-- AddForeignKey
ALTER TABLE "sub_categories_2" ADD CONSTRAINT "sub_categories_2_sub_category_1_id_fkey" FOREIGN KEY ("sub_category_1_id") REFERENCES "sub_categories_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resource_library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_library" ADD CONSTRAINT "resource_library_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_library" ADD CONSTRAINT "resource_library_sub_category_2_id_fkey" FOREIGN KEY ("sub_category_2_id") REFERENCES "sub_categories_2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_categories_1" ADD CONSTRAINT "sub_categories_1_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
