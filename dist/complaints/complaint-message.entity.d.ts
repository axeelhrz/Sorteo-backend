import { User } from '../users/user.entity';
import { Complaint } from './complaint.entity';
export declare const MessageSender: {
    readonly USER: "user";
    readonly ADMIN: "admin";
    readonly SHOP: "shop";
};
export type MessageSender = typeof MessageSender[keyof typeof MessageSender];
export declare class ComplaintMessage {
    id: string;
    complaintId: string;
    complaint: Complaint;
    senderId: string;
    sender: User;
    senderType: MessageSender;
    message: string;
    createdAt: Date;
}
