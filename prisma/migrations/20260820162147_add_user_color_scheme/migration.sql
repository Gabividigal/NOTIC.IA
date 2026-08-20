-- CreateEnum
CREATE TYPE "ColorScheme" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "colorScheme" "ColorScheme" NOT NULL DEFAULT 'DARK';
