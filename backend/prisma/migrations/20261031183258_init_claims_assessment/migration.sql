-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ASSESSED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('JUSTIFIED', 'NOT_JUSTIFIED', 'INCONCLUSIVE');

-- CreateTable
CREATE TABLE "Claim" (
    "id" UUID NOT NULL,
    "productName" TEXT NOT NULL,
    "claimText" TEXT NOT NULL,
    "claimCategory" TEXT NOT NULL,
    "formulation" JSONB,
    "targetMetric" TEXT,
    "targetValue" DOUBLE PRECISION,
    "durationWeeks" INTEGER,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" UUID NOT NULL,
    "claimId" UUID NOT NULL,
    "evidence" JSONB NOT NULL,
    "studySampleSize" INTEGER,
    "actualResult" DOUBLE PRECISION,
    "pValue" DOUBLE PRECISION,
    "justified" BOOLEAN NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "status" "AssessmentStatus" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "limitations" JSONB,
    "recommendation" TEXT,
    "modelName" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_claimCategory_idx" ON "Claim"("claimCategory");

-- CreateIndex
CREATE INDEX "Assessment_claimId_idx" ON "Assessment"("claimId");

-- CreateIndex
CREATE INDEX "Assessment_createdAt_idx" ON "Assessment"("createdAt");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
