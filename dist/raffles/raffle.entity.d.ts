import { Shop } from '../shops/shop.entity';
import { Product } from '../products/product.entity';
import { RaffleTicket } from '../raffle-tickets/raffle-ticket.entity';
import { Deposit } from '../deposits/deposit.entity';
export declare const RaffleStatus: {
    readonly DRAFT: "draft";
    readonly PENDING_APPROVAL: "pending_approval";
    readonly ACTIVE: "active";
    readonly PAUSED: "paused";
    readonly SOLD_OUT: "sold_out";
    readonly FINISHED: "finished";
    readonly CANCELLED: "cancelled";
    readonly REJECTED: "rejected";
};
export type RaffleStatus = typeof RaffleStatus[keyof typeof RaffleStatus];
export declare class Raffle {
    id: string;
    shopId: string;
    shop: Shop;
    productId: string;
    product: Product;
    productValue: number;
    totalTickets: number;
    soldTickets: number;
    status: RaffleStatus;
    requiresDeposit: boolean;
    winnerTicketId: string;
    specialConditions: string;
    createdAt: Date;
    updatedAt: Date;
    activatedAt: Date;
    raffleExecutedAt: Date;
    drawnBy: string;
    drawTrigger: 'automatic' | 'manual';
    totalValidTickets: number;
    tickets: RaffleTicket[];
    deposits: Deposit[];
}
