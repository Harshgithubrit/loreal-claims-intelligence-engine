
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateClinicalEvidenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  studyTitle: string;

  @IsString()
  @IsNotEmpty()
  studyDesign: string;

  @IsString()
  @IsNotEmpty()
  population: string;

  @IsInt()
  @Min(1)
  sampleSize: number;

  @IsInt()
  @Min(1)
  durationWeeks: number;

  @IsString()
  @IsNotEmpty()
  methodology: string;

  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsOptional()
  @IsNumber()
  baselineMean?: number;

  @IsOptional()
  @IsNumber()
  followUpMean?: number;

  @IsOptional()
  @IsNumber()
  controlBaselineMean?: number;

  @IsOptional()
  @IsNumber()
  controlFollowUpMean?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  pValue?: number;

  @IsOptional()
  @IsNumber()
  confidenceIntervalLower?: number;

  @IsOptional()
  @IsNumber()
  confidenceIntervalUpper?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  limitations?: string[];

  @IsOptional()
  @IsBoolean()
  isSynthetic?: boolean;
}
