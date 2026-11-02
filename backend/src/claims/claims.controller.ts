
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { ClaimsService } from './claims.service.js';
import { CreateClaimDto } from './dto/create-claim.dto.js';
import { UpdateClaimDto } from './dto/update-claim.dto.js';
import { CreateClinicalEvidenceDto } from './dto/create-clinical-evidence.dto.js';

@Controller('api/claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  create(@Body() dto: CreateClaimDto) {
    return this.claimsService.create(dto);
  }

  @Get()
  findAll() {
    return this.claimsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClaimDto,
  ) {
    return this.claimsService.update(id, dto);
  }

  @Patch(':id/submit')
  submit(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.submit(id);
  }

  @Post(':id/evidence')
addEvidence(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: CreateClinicalEvidenceDto,
) {
  return this.claimsService.addEvidence(id, dto);
}

@Get(':id/evidence')
findEvidence(
  @Param('id', ParseUUIDPipe) id: string,
) {
  return this.claimsService.findEvidence(id);
}
}
