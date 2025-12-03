import { RaffleTicketsService } from './raffle-tickets.service';
import { CreateRaffleTicketDto } from './dto/create-raffle-ticket.dto';
import { RaffleTicket } from './raffle-ticket.entity';
export declare class RaffleTicketsController {
    private readonly ticketsService;
    constructor(ticketsService: RaffleTicketsService);
    create(createTicketDto: CreateRaffleTicketDto): Promise<RaffleTicket[]>;
    findAll(req: any, raffleId?: string, userId?: string): Promise<RaffleTicket[]>;
    findOne(id: string): Promise<RaffleTicket>;
    findByRaffle(raffleId: string): Promise<RaffleTicket[]>;
    findByUser(userId: string): Promise<RaffleTicket[]>;
    markAsWinner(id: string): Promise<RaffleTicket>;
    refund(id: string): Promise<RaffleTicket>;
}
