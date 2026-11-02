
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  productName: string;

  @IsString()
  @IsNotEmpty()
  claimText: string;

  @IsString()
  @IsNotEmpty()
  claimCategory: string;

  @IsOptional()
  @IsObject()
  formulation?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  targetMetric?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  targetValue?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationWeeks?: number;
}
