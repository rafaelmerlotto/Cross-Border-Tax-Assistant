-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "taxYear" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "caseContext" JSONB,
    "ruleResults" JSONB,
    "requirements" JSONB,
    "report" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Consultation_status_idx" ON "Consultation"("status");

-- CreateIndex
CREATE INDEX "Consultation_expiresAt_idx" ON "Consultation"("expiresAt");
