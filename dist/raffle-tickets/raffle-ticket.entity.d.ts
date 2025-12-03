import { Raffle } from '../raffles/raffle.entity';
import { User } from '../users/user.entity';
export declare const RaffleTicketStatus: {
    readonly SOLD: "sold";
    readonly WINNER: "winner";
    readonly REFUNDED: "refunded";
};
export type RaffleTicketStatus = typeof RaffleTicketStatus[keyof typeof RaffleTicketStatus];
export declare class RaffleTicket {
    id: string;
    raffleId: string;
    raffle: Raffle;
    userId: string;
    user: User;
    number: number;
    status: RaffleTicketStatus;
    purchasedAt: Date;
    paymentId: string;
}
