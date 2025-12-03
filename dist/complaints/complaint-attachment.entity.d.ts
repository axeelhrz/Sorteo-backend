import { Complaint } from './complaint.entity';
import { User } from '../users/user.entity';
export declare class ComplaintAttachment {
    id: string;
    complaintId: string;
    complaint: Complaint;
    uploadedBy: string;
    uploader: User;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    description: string;
    createdAt: Date;
}
