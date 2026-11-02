
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
  BadGatewayException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { Prisma, ClaimStatus, AssessmentStatus } from '@prisma/client';
import OpenAI from 'openai';

import { PrismaService } from '../prisma/prisma.service.js';

const PROMPT_VERSION = 'claim-evaluation-v1';

const ASSESSMENT_SCHEMA = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['JUSTIFIED', 'NOT_JUSTIFIED', 'INCONCLUSIVE'],
    },
    justified: {
      type: 'boolean',
    },
    confidenceScore: {
      type: 'number',
    },
    reasoning: {
      type: 'string',
    },
    limitations: {
      type: 'array',
      items: { type: 'string' },
    },
    recommendation: {
      type: 'string',
    },
  },
  required: [
    'status',
    'justified',
    'confidenceScore',
    'reasoning',
    'limitations',
    'recommendation',
  ],
  additionalProperties: false,
};

function getDesiredDirection(
  claimText: string,
  targetMetric: string | null,
): 'increase' | 'decrease' | null {
  const text = `${claimText} ${targetMetric ?? ''}`.toLowerCase();

  const increasePattern =
    /\b(improve|improvement|increase|enhance|enhancement|boost|hydration|moisture)\b/;

  const decreasePattern =
    /\b(reduce|reduction|decrease|decreased|lower|less|diminish|diminished)\b/;

  const wantsIncrease = increasePattern.test(text);
  const wantsDecrease = decreasePattern.test(text);

  // Avoid guessing when the claim direction is ambiguous.
  if (wantsIncrease === wantsDecrease) {
    return null;
  }

  return wantsIncrease ? 'increase' : 'decrease';
}

@Injectable()
export class AssessmentsService {
  private readonly openai: OpenAI | null;
  private readonly model: string;
  private readonly aiProvider: string;

constructor(
  private readonly prisma: PrismaService,
  private readonly configService: ConfigService,
) {
  const apiKey = this.configService.get<string>('OPENAI_API_KEY');

  this.aiProvider = (
    this.configService.get<string>('AI_PROVIDER') ?? 'openai'
  ).toLowerCase();

  this.openai = apiKey ? new OpenAI({ apiKey }) : null;

  this.model =
    this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
}

  async evaluateClaim(claimId: string) {

    // 1. Retrieve claim and clinical evidence
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        clinicalEvidence: true,
      },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (
      claim.status !== ClaimStatus.SUBMITTED &&
      claim.status !== ClaimStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        'Only submitted claims can be assessed',
      );
    }

    if (claim.clinicalEvidence.length === 0) {
      throw new BadRequestException(
        'No clinical evidence found for this claim',
      );
    }

    // 2. Calculate numerical changes in TypeScript
    const direction = getDesiredDirection(
  claim.claimText,
  claim.targetMetric,
);

const evidenceAnalysis = claim.clinicalEvidence.map((study) => {
  const calculateChange = (
    baseline: number | null,
    followUp: number | null,
  ): number | null => {
    if (
      direction === null ||
      baseline === null ||
      baseline <= 0 ||
      followUp === null
    ) {
      return null;
    }

    if (direction === 'increase') {
      return ((followUp - baseline) / baseline) * 100;
    }

    return ((baseline - followUp) / baseline) * 100;
  };

  const treatmentChange = calculateChange(
    study.baselineMean,
    study.followUpMean,
  );

  const controlChange = calculateChange(
    study.controlBaselineMean,
    study.controlFollowUpMean,
  );

  const netEffect =
    treatmentChange !== null && controlChange !== null
      ? treatmentChange - controlChange
      : null;

  return {
    studyId: study.id,
    studyTitle: study.studyTitle,
    sampleSize: study.sampleSize,
    studyDesign: study.studyDesign,
    durationWeeks: study.durationWeeks,

    desiredDirection: direction,

    treatmentChangePercent: treatmentChange,
    controlChangePercent: controlChange,
    netEffectPercentagePoints: netEffect,

    pValue: study.pValue,

    reportedConfidenceInterval: {
      lower: study.confidenceIntervalLower,
      upper: study.confidenceIntervalUpper,
    },

    endpoint: study.endpoint,
    methodology: study.methodology,
    population: study.population,
    limitations: study.limitations,
    isSynthetic: study.isSynthetic,
  };
});

    // 3. Prepare evidence snapshot
    const evidenceSnapshot = JSON.parse(
      JSON.stringify({
        studies: claim.clinicalEvidence,
        calculatedAnalysis: evidenceAnalysis,
      }),
    ) as Prisma.InputJsonValue;

//     // 4. Ask OpenAI to evaluate the evidence
//     const response = await openai.responses.create({
//       model: this.model,

//       instructions: `
// You are a scientific evidence assessment assistant
// for a cosmetic product claims review system.

// Evaluate whether the supplied clinical evidence supports
// the exact product claim.

// Rules:
// 1. Evaluate the exact wording, numerical target and duration.
// 2. Consider treatment results and control-group results.
// 3. Consider study design, sample size, methodology and limitations.
// 4. Do not invent missing data or statistical findings.
// 5. Do not assume a p-value alone proves the claim.
// 6. Do not interpret a confidence interval without knowing
//    its definition and statistical context.
// 7. If important information is missing or the evidence is
//    insufficient, return INCONCLUSIVE.
// 8. Synthetic evidence must be clearly treated as simulated
//    and cannot establish real-world product efficacy.
// 9. ConfidenceScore must be between 0 and 1. It represents
//    your confidence in the assessment, not the probability
//    that the product works.
// 10. Return only the requested structured assessment.
// `,

//       input: JSON.stringify({
//         claim: {
//           productName: claim.productName,
//           claimText: claim.claimText,
//           claimCategory: claim.claimCategory,
//           formulation: claim.formulation,
//           targetMetric: claim.targetMetric,
//           targetValue: claim.targetValue,
//           durationWeeks: claim.durationWeeks,
//         },
//         evidenceAnalysis,
//       }),

//       text: {
//         format: {
//           type: 'json_schema',
//           name: 'claim_assessment',
//           strict: true,
//           schema: ASSESSMENT_SCHEMA,
//         },
//       },
//     });

    // 5. Parse structured response
// 4. Generate the assessment using the selected provider
let result: {
  status: AssessmentStatus;
  justified: boolean;
  confidenceScore: number;
  reasoning: string;
  limitations: string[];
  recommendation: string;
};

if (this.aiProvider === 'mock') {
  // Development-only simulated assessment.
  const hasSyntheticEvidence = evidenceAnalysis.some(
    (study) => study.isSynthetic,
  );

  if (hasSyntheticEvidence) {
    result = {
      status: AssessmentStatus.INCONCLUSIVE,
      justified: false,
      confidenceScore: 0.95,
      reasoning:
        'This is a simulated assessment generated in mock mode. ' +
        'The supplied clinical evidence is marked as synthetic. ' +
        'Although the treatment group shows a calculated reduction, ' +
        'the results cannot establish real-world product efficacy. ' +
        'Therefore, the claim cannot be considered clinically justified.',
      limitations: [
        'Mock mode was used; no real LLM evaluation was performed.',
        'The supplied clinical evidence is synthetic.',
        'The study has a relatively small sample size.',
        'The study duration is limited to four weeks.',
        'The reported p-value and confidence interval have not been independently verified.',
      ],
      recommendation:
        'Replace the synthetic study with authentic, independently reviewed clinical evidence and perform a real scientific assessment.',
    };
  } else {
    result = {
      status: AssessmentStatus.INCONCLUSIVE,
      justified: false,
      confidenceScore: 0.9,
      reasoning:
        'This is a simulated assessment generated in mock mode. ' +
        'The mock evaluator does not independently validate clinical study quality or establish product efficacy.',
      limitations: [
        'Mock mode was used; no real LLM evaluation was performed.',
        'Clinical evidence requires review by a qualified scientific evaluator.',
      ],
      recommendation:
        'Use the OpenAI provider or a qualified scientific evaluator for a genuine evidence assessment.',
    };
  }
} else if (this.aiProvider === 'openai') {
  if (!this.openai) {
    throw new ServiceUnavailableException(
      'OPENAI_API_KEY is not configured',
    );
  }

  const response = await this.openai.responses.create({
    model: this.model,
    instructions: `
You are a scientific evidence assessment assistant
for a cosmetic product claims review system.

Evaluate whether the supplied clinical evidence supports
the exact product claim.

Rules:
1. Evaluate the exact wording, numerical target and duration.
2. Consider treatment results and control-group results.
3. Consider study design, sample size, methodology and limitations.
4. Do not invent missing data or statistical findings.
5. Do not assume a p-value alone proves the claim.
6. Do not interpret a confidence interval without knowing
   its definition and statistical context.
7. If important information is missing or the evidence is
   insufficient, return INCONCLUSIVE.
8. Synthetic evidence must be clearly treated as simulated
   and cannot establish real-world product efficacy.
9. ConfidenceScore must be between 0 and 1. It represents
   your confidence in the assessment, not the probability
   that the product works.
10. Return only the requested structured assessment.
11. The supplied treatmentChangePercent and controlChangePercent
    are already calculated in the direction desired by the claim.
12. Positive values indicate movement in the desired direction.
    Negative values indicate movement against the desired direction.
13. netEffectPercentagePoints represents treatment change minus
    control change in the desired direction.
14. If desiredDirection is null, the claim direction is ambiguous.
    Do not conclude that the evidence supports the claim.
`,
    input: JSON.stringify({
      claim: {
        productName: claim.productName,
        claimText: claim.claimText,
        claimCategory: claim.claimCategory,
        formulation: claim.formulation,
        targetMetric: claim.targetMetric,
        targetValue: claim.targetValue,
        durationWeeks: claim.durationWeeks,
      },
      evidenceAnalysis,
    }),
    text: {
      format: {
        type: 'json_schema',
        name: 'claim_assessment',
        strict: true,
        schema: ASSESSMENT_SCHEMA,
      },
    },
  });

  try {
    result = JSON.parse(response.output_text);
  } catch {
    throw new BadGatewayException(
      'AI returned an invalid assessment response',
    );
  }
} else {
  throw new BadRequestException(
    `Unsupported AI_PROVIDER: ${this.aiProvider}`,
  );
}

    if (
      !Object.values(AssessmentStatus).includes(result.status) ||
      typeof result.justified !== 'boolean' ||
      !Number.isFinite(result.confidenceScore) ||
      result.confidenceScore < 0 ||
      result.confidenceScore > 1 ||
      typeof result.reasoning !== 'string' ||
      !Array.isArray(result.limitations) ||
      !result.limitations.every(
        (item) => typeof item === 'string',
      ) ||
      typeof result.recommendation !== 'string'
    ) {
      throw new BadGatewayException(
        'AI returned an invalid assessment structure',
      );
    }

    if (
      (result.status === AssessmentStatus.JUSTIFIED) !==
      result.justified
    ) {
      throw new BadGatewayException(
        'AI returned inconsistent assessment status',
      );
    }

    // 6. Persist assessment and update claim atomically
    const assessment = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.assessment.create({
        data: {
          claimId: claim.id,
          evidence: evidenceSnapshot,
          studySampleSize: claim.clinicalEvidence.reduce(
            (total, study) => total + study.sampleSize,
            0,
          ),
          justified: result.justified,
          confidenceScore: result.confidenceScore,
          status: result.status,
          reasoning: result.reasoning,
          limitations: result.limitations,
          recommendation: result.recommendation,
          modelName: this.model,
          promptVersion: PROMPT_VERSION,
        },
      });

      await tx.claim.update({
        where: { id: claim.id },
        data: { status: ClaimStatus.ASSESSED },
      });

      return saved;
    });

    return assessment;
  }

  async findAssessments(claimId: string) {
  // 1. Check whether the claim exists
  const claim = await this.prisma.claim.findUnique({
    where: {
      id: claimId,
    },
    select: {
      id: true,
      productName: true,
      claimText: true,
    },
  });

  if (!claim) {
    throw new NotFoundException('Claim not found');
  }

  // 2. Retrieve all assessments for this claim
  const assessments = await this.prisma.assessment.findMany({
    where: {
      claimId: claimId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 3. Return claim and assessment history
  return {
    claim,
    totalAssessments: assessments.length,
    assessments,
  };
}
}
