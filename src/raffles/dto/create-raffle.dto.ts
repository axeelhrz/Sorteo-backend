import { IsString, IsOptional, IsUUID, MaxLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRaffleDto {
  @IsUUID()
  shopId: string;

  @IsUUID()
  productId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalTickets?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  specialConditions?: string;
}