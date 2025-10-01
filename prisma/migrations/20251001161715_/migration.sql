/*
  Warnings:

  - The primary key for the `Vehicle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deletedAt` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Vehicle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[placa]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chassi]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[renavam]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ano` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chassi` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marca` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelo` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placa` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `renavam` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Vehicle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "public"."Vehicle_email_key";

-- AlterTable
ALTER TABLE "public"."Vehicle" DROP CONSTRAINT "Vehicle_pkey",
DROP COLUMN "deletedAt",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "password",
ADD COLUMN     "ano" INTEGER NOT NULL,
ADD COLUMN     "chassi" VARCHAR(17) NOT NULL,
ADD COLUMN     "marca" VARCHAR(100) NOT NULL,
ADD COLUMN     "modelo" VARCHAR(100) NOT NULL,
ADD COLUMN     "placa" VARCHAR(8) NOT NULL,
ADD COLUMN     "renavam" VARCHAR(11) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_placa_key" ON "public"."Vehicle"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_chassi_key" ON "public"."Vehicle"("chassi");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_renavam_key" ON "public"."Vehicle"("renavam");

-- CreateIndex
CREATE INDEX "Vehicle_modelo_idx" ON "public"."Vehicle"("modelo");

-- CreateIndex
CREATE INDEX "Vehicle_marca_idx" ON "public"."Vehicle"("marca");

-- CreateIndex
CREATE INDEX "Vehicle_ano_idx" ON "public"."Vehicle"("ano");
