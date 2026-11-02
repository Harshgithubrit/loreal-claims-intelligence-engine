-- CreateTable
CREATE TABLE "ClinicalEvidence" (
    "id" UUID NOT NULL,
    "claimId" UUID NOT NULL,
    "studyTitle" TEXT NOT NULL,
    "studyDesign" TEXT NOT NULL,
    "population" TEXT NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "durationWeeks" INTEGER NOT NULL,
    "methodology" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "baselineMean" DOUBLE PRECISION,
    "followUpMean" DOUBLE PRECISION,
    "controlBaselineMean" DOUBLE PRECISION,
    "controlFollowUpMean" DOUBLE PRECISION,
    "pValue" DOUBLE PRECISION,
    "confidenceIntervalLower" DOUBLE PRECISION,
    "confidenceIntervalUpper" DOUBLE PRECISION,
    "limitations" JSONB,
    "isSynthetic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicalEvidence_claimId_idx" ON "ClinicalEvidence"("claimId");

-- CreateIndex
CREATE INDEX "ClinicalEvidence_createdAt_idx" ON "ClinicalEvidence"("createdAt");

-- AddForeignKey
ALTER TABLE "ClinicalEvidence" ADD CONSTRAINT "ClinicalEvidence_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
