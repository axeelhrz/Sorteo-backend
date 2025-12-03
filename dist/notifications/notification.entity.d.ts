import { User } from '../users/user.entity';
export declare const NotificationType: {
    readonly PURCHASE_CONFIRMED: "purchase_confirmed";
    readonly PURCHASE_FAILED: "purchase_failed";
    readonly RAFFLE_RESULT_WINNER: "raffle_result_winner";
    readonly RAFFLE_RESULT_LOSER: "raffle_result_loser";
    readonly RAFFLE_APPROVED: "raffle_approved";
    readonly RAFFLE_REJECTED: "raffle_rejected";
    readonly RAFFLE_CANCELLED: "raffle_cancelled";
    readonly RAFFLE_PENDING_APPROVAL: "raffle_pending_approval";
    readonly RAFFLE_SOLD_OUT: "raffle_sold_out";
    readonly SHOP_VERIFIED: "shop_verified";
    readonly SHOP_BLOCKED: "shop_blocked";
    readonly ADMIN_ACTION: "admin_action";
};
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl: string;
    isRead: boolean;
    metadata: string;
    createdAt: Date;
    readAt: Date;
}
