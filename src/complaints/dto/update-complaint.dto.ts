import { IsEnum, IsString, IsUUID, IsOptional } from 'class-validator';
import { ComplaintStatus, ComplaintResolution } from '../complaint.entity';

export class UpdateComplaintDto {
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @IsOptional()
  @IsEnum(ComplaintResolution)
  resolution?: ComplaintResolution;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsUUID()
  assignedAdminId?: string;
}