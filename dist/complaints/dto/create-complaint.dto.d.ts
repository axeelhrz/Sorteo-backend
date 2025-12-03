import { ComplaintType } from '../complaint.entity';
export declare class CreateComplaintDto {
    type: ComplaintType;
    description: string;
    raffleId?: string;
    shopId?: string;
    paymentId?: string;
}
