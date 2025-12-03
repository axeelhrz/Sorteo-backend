import { IsEnum, IsString, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ComplaintType } from '../complaint.entity';

export class CreateComplaintDto {
  @IsEnum(ComplaintType)
  type: ComplaintType;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsUUID()
  raffleId?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsUUID()
  paymentId?: string;
}