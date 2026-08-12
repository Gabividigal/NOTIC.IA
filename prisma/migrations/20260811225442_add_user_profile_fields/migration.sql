/*
  Warnings:

  - Added the required column `areaAtuacao` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataNascimento` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "areaAtuacao" TEXT NOT NULL,
ADD COLUMN     "dataNascimento" TIMESTAMP(3) NOT NULL;
