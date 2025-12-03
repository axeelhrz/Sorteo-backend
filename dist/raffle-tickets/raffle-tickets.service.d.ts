import { Repository } from 'typeorm';
import { RaffleTicket } from './raffle-ticket.entity';
import { CreateRaffleTicketDto } from './dto/create-raffle-ticket.dto';
import { Raffle } from '../raffles/raffle.entity';
import { User } from '../users/user.entity';
import { RaffleExecutionService } from '../raffles/raffle-execution.service';
import { NotificationEventService } from '../notifications/notification-event.service';
export declare class RaffleTicketsService {
    private ticketsRepository;
    private rafflesRepository;
    private usersRepository;
    private raffleExecutionService;
    private notificationEventService;
    private readonly logger;
    constructor(ticketsRepository: Repository<RaffleTicket>, rafflesRepository: Repository<Raffle>, usersRepository: Repository<User>, raffleExecutionService: RaffleExecutionService, notificationEventService: NotificationEventService);
    create(createRaffleTicketDto: CreateRaffleTicketDto): Promise<RaffleTicket[]>;
    findAll(): Promise<RaffleTicket[]>;
    findById(id: string): Promise<RaffleTicket>;
    findByRaffleId(raffleId: string): Promise<RaffleTicket[]>;
    findByUserId(userId: string): Promise<RaffleTicket[]>;
    findByUserAndRaffle(userId: string, raffleId: string): Promise<RaffleTicket[]>;
    markAsWinner(id: string): Promise<RaffleTicket>;
    refund(id: string): Promise<RaffleTicket>;
    countByRaffleId(raffleId: string): Promise<number>;
    countWinnersByRaffleId(raffleId: string): Promise<number>;
    delete(id: string): Promise<void>;
}
