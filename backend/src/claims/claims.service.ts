
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { Prisma, ClaimStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

import { CreateClaimDto } from './dto/create-claim.dto.js';
import { UpdateClaimDto } from './dto/update-claim.dto.js';
import { CreateClinicalEvidenceDto } from './dto/create-clinical-evidence.dto.js';

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new claim
  async create(dto: CreateClaimDto) {
    return this.prisma.claim.create({
      data: {
        productName: dto.productName,
        claimText: dto.claimText,
        claimCategory: dto.claimCategory,
        formulation: dto.formulation as Prisma.InputJsonValue | undefined,
        targetMetric: dto.targetMetric,
        targetValue: dto.targetValue,
        durationWeeks: dto.durationWeeks,
      },
    });
  }

  // Retrieve all claims
  async findAll() {
    return this.prisma.claim.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        assessments: true,
      },
    });
  }

  // Retrieve one claim
  async findOne(id: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        assessments: true,
      },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return claim;
  }

  // Update a draft claim
  async update(id: string, dto: UpdateClaimDto) {
    const claim = await this.findOne(id);

    if (claim.status !== ClaimStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft claims can be updated',
      );
    }

    return this.prisma.claim.update({
      where: { id },
      data: {
        ...dto,
        formulation: dto.formulation as Prisma.InputJsonValue | undefined,
      },
    });
  }

  // Submit a draft claim for review
  async submit(id: string) {
    const claim = await this.findOne(id);

    if (claim.status !== ClaimStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft claims can be submitted',
      );
    }

    return this.prisma.claim.update({
      where: { id },
      data: {
        status: ClaimStatus.SUBMITTED,
      },
    });
  }

  // Submit clinical evidence for a claim
async addEvidence(
  claimId: string,
  dto: CreateClinicalEvidenceDto,
) {
  await this.findOne(claimId);

  const { limitations, ...studyData } = dto;

  return this.prisma.clinicalEvidence.create({
    data: {
      ...studyData,
      claimId,
      limitations:
        limitations as Prisma.InputJsonValue | undefined,
    },
  });
}

// Retrieve all evidence belonging to a claim
async findEvidence(claimId: string) {
  await this.findOne(claimId);

  return this.prisma.clinicalEvidence.findMany({
    where: { claimId },
    orderBy: { createdAt: 'desc' },
  });
}
}
