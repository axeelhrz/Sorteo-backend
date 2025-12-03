import { ComplaintStatus, ComplaintResolution } from '../complaint.entity';
export declare class UpdateComplaintDto {
    status?: ComplaintStatus;
    resolution?: ComplaintResolution;
    resolutionNotes?: string;
    assignedAdminId?: string;
}
