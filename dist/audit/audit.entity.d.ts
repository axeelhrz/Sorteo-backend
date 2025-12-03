import { User } from '../users/user.entity';
export declare const AuditAction: {
    readonly RAFFLE_APPROVED: "raffle_approved";
    readonly RAFFLE_REJECTED: "raffle_rejected";
    readonly RAFFLE_CANCELLED: "raffle_cancelled";
    readonly RAFFLE_EXECUTED: "raffle_executed";
    readonly RAFFLE_EXECUTION_FAILED: "raffle_execution_failed";
    readonly SHOP_STATUS_CHANGED: "shop_status_changed";
    readonly SHOP_VERIFIED: "shop_verified";
    readonly SHOP_BLOCKED: "shop_blocked";
    readonly USER_SUSPENDED: "user_suspended";
    readonly COMPLAINT_CREATED: "complaint_created";
    readonly COMPLAINT_UPDATED: "complaint_updated";
    readonly COMPLAINT_RESOLVED: "complaint_resolved";
    readonly TICKET_PURCHASED: "ticket_purchased";
    readonly PAYMENT_PROCESSED: "payment_processed";
    readonly PRODUCT_CREATED: "product_created";
    readonly PRODUCT_UPDATED: "product_updated";
    readonly USER_CREATED: "user_created";
    readonly USER_UPDATED: "user_updated";
};
export type AuditAction = typeof AuditAction[keyof typeof AuditAction];
export declare class AuditLog {
    id: string;
    adminId: string;
    admin: User;
    action: AuditAction;
    entityType: string;
    entityId: string;
    previousStatus: string;
    newStatus: string;
    reason: string;
    details: string;
    createdAt: Date;
}
