import { IsString, IsNumber, IsOptional, IsPositive, Min, Max, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsUUID()
  shopId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  value: number;

  @IsNumber()
  @IsPositive()
  height: number;

  @IsNumber()
  @IsPositive()
  width: number;

  @IsNumber()
  @IsPositive()
  depth: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  mainImage?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  value?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  height?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  width?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  depth?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  mainImage?: string;
}

export class ProductResponseDto {
  id: string;
  shopId: string;
  name: string;
  description: string;
  value: number;
  height: number;
  width: number;
  depth: number;
  requiresDeposit: boolean;
  category?: string;
  mainImage?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductWithDepositInfoDto extends ProductResponseDto {
  depositRequired: boolean;
  depositAmount: number;
  depositReason: string;
}