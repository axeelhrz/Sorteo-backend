import { User } from '../users/user.entity';
import { Shop } from '../shops/shop.entity';
import { Raffle } from '../raffles/raffle.entity';
import { Payment } from '../payments/payment.entity';
import { ComplaintMessage } from './complaint-message.entity';
import { ComplaintAttachment } from './complaint-attachment.entity';
export declare const ComplaintType: {
    readonly PRIZE_NOT_DELIVERED: "prize_not_delivered";
    readonly DIFFERENT_PRODUCT: "different_product";
    readonly PURCHASE_PROBLEM: "purchase_problem";
    readonly SHOP_BEHAVIOR: "shop_behavior";
    readonly RAFFLE_FRAUD: "raffle_fraud";
    readonly TECHNICAL_ISSUE: "technical_issue";
    readonly PAYMENT_ERROR: "payment_error";
};
export type ComplaintType = typeof ComplaintType[keyof typeof ComplaintType];
export declare const ComplaintStatus: {
    readonly PENDING: "pending";
    readonly IN_REVIEW: "in_review";
    readonly RESOLVED: "resolved";
    readonly REJECTED: "rejected";
    readonly CANCELLED: "cancelled";
};
export type ComplaintStatus = typeof ComplaintStatus[keyof typeof ComplaintStatus];
export declare const ComplaintResolution: {
    readonly RESOLVED_USER_FAVOR: "resolved_user_favor";
    readonly RESOLVED_SHOP_FAVOR: "resolved_shop_favor";
    readonly RESOLVED_PLATFORM_FAVOR: "resolved_platform_favor";
    readonly REJECTED: "rejected";
    readonly CANCELLED: "cancelled";
};
export type ComplaintResolution = typeof ComplaintResolution[keyof typeof ComplaintResolution];
export declare class Complaint {
    id: string;
    complaintNumber: string;
    userId: string;
    user: User;
    shopId: string;
    shop: Shop;
    raffleId: string;
    raffle: Raffle;
    paymentId: string;
    payment: Payment;
    type: ComplaintType;
    description: string;
    status: ComplaintStatus;
    resolution: ComplaintResolution;
    assignedAdminId: string;
    assignedAdmin: User;
    resolutionNotes: string;
    resolvedAt: Date;
    maxResponseDate: Date;
    createdAt: Date;
    updatedAt: Date;
    messages: ComplaintMessage[];
    attachments: ComplaintAttachment[];
}
