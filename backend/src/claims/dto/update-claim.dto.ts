
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class UpdateClaimDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  productName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  claimText?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  claimCategory?: string;

  @IsOptional()
  @IsObject()
  formulation?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  targetMetric?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationWeeks?: number;
}
