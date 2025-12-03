import { User } from '../users/user.entity';
export declare class NotificationPreference {
    id: string;
    userId: string;
    user: User;
    emailPurchaseConfirmation: boolean;
    emailRaffleResult: boolean;
    emailRaffleStatusChange: boolean;
    emailShopStatusChange: boolean;
    emailPromotions: boolean;
    inAppNotifications: boolean;
    createdAt: Date;
    updatedAt: Date;
}
