import { Repository } from 'typeorm';
import { Raffle, RaffleStatus } from './raffle.entity';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { Shop } from '../shops/shop.entity';
import { Product } from '../products/product.entity';
import { Deposit } from '../deposits/deposit.entity';
import { NotificationEventService } from '../notifications/notification-event.service';
export declare class RafflesService {
    private rafflesRepository;
    private shopsRepository;
    private productsRepository;
    private depositsRepository;
    private notificationEventService;
    private readonly logger;
    constructor(rafflesRepository: Repository<Raffle>, shopsRepository: Repository<Shop>, productsRepository: Repository<Product>, depositsRepository: Repository<Deposit>, notificationEventService: NotificationEventService);
    create(createRaffleDto: CreateRaffleDto): Promise<Raffle>;
    findAll(): Promise<Raffle[]>;
    findById(id: string): Promise<Raffle>;
    findByShopId(shopId: string): Promise<Raffle[]>;
    findActive(): Promise<Raffle[]>;
    findPublicActive(filters: {
        search?: string;
        category?: string;
        shopId?: string;
        minValue?: number;
        maxValue?: number;
        status?: RaffleStatus;
        sortBy?: 'newest' | 'closest' | 'price-asc' | 'price-desc';
        page?: number;
        limit?: number;
    }): Promise<{
        data: Raffle[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCategories(): Promise<string[]>;
    getShopsWithActiveRaffles(): Promise<Array<{
        id: string;
        name: string;
    }>>;
    findByStatus(status: RaffleStatus): Promise<Raffle[]>;
    submitForApproval(id: string): Promise<Raffle>;
    approve(id: string): Promise<Raffle>;
    reject(id: string): Promise<Raffle>;
    incrementSoldTickets(id: string, quantity: number): Promise<Raffle>;
    executeRaffle(id: string, winnerTicketId: string): Promise<Raffle>;
    cancel(id: string): Promise<Raffle>;
    update(id: string, updateData: Partial<CreateRaffleDto>): Promise<Raffle>;
    delete(id: string): Promise<void>;
    /**
     * Pausar un sorteo activo
     */
    pause(id: string): Promise<Raffle>;
    /**
     * Reanudar un sorteo pausado
     */
    resume(id: string): Promise<Raffle>;
}
