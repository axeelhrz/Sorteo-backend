import { Shop } from '../shops/shop.entity';
import { Raffle } from '../raffles/raffle.entity';
export declare const DepositStatus: {
    readonly PENDING: "pending";
    readonly HELD: "held";
    readonly RELEASED: "released";
    readonly EXECUTED: "executed";
};
export type DepositStatus = typeof DepositStatus[keyof typeof DepositStatus];
export declare class Deposit {
    id: string;
    shopId: string;
    shop: Shop;
    raffleId: string;
    raffle: Raffle;
    amount: number;
    status: DepositStatus;
    createdAt: Date;
    updatedAt: Date;
    paymentId: string;
    notes: string;
}
