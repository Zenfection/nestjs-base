-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tfaSecret" TEXT;
