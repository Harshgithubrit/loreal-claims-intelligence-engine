import {
  Controller,
  Post,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AssessmentsService } from './assessments.service.js';

@Controller('api/claims')
export class AssessmentsController {
  constructor(
    private readonly assessmentsService: AssessmentsService,
  ) {}

  // Generate a new assessment
  @Post(':id/assess')
  evaluateClaim(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assessmentsService.evaluateClaim(id);
  }

  // Retrieve previous assessments
  @Get(':id/assessments')
  findAssessments(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assessmentsService.findAssessments(id);
  }
}