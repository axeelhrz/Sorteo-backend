import { Repository } from 'typeorm';
import { Shop, ShopStatus } from './shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { User } from '../users/user.entity';
import { Raffle } from '../raffles/raffle.entity';
import { Payment } from '../payments/payment.entity';
import { RaffleTicket } from '../raffle-tickets/raffle-ticket.entity';
export declare class ShopsService {
    private shopsRepository;
    private usersRepository;
    private rafflesRepository;
    private paymentsRepository;
    private ticketsRepository;
    constructor(shopsRepository: Repository<Shop>, usersRepository: Repository<User>, rafflesRepository: Repository<Raffle>, paymentsRepository: Repository<Payment>, ticketsRepository: Repository<RaffleTicket>);
    create(createShopDto: CreateShopDto): Promise<Shop>;
    findAll(): Promise<Shop[]>;
    findById(id: string): Promise<Shop>;
    findByUserId(userId: string): Promise<Shop[]>;
    /**
     * Obtiene o crea una tienda para un usuario con rol shop
     * Si no existe, la crea automáticamente usando el nombre del usuario
     */
    getOrCreateShopForUser(userId: string, userName: string): Promise<Shop>;
    findVerified(): Promise<Shop[]>;
    updateStatus(id: string, status: ShopStatus): Promise<Shop>;
    verify(id: string): Promise<Shop>;
    block(id: string): Promise<Shop>;
    update(id: string, updateData: Partial<CreateShopDto>): Promise<Shop>;
    delete(id: string): Promise<void>;
    /**
     * Obtiene estadísticas completas de una tienda
     */
    getShopStatistics(shopId: string): Promise<{
        raffles: {
            total: number;
            draft: number;
            pendingApproval: number;
            active: number;
            soldOut: number;
            finished: number;
            cancelled: number;
        };
        tickets: {
            totalSold: number;
            totalAvailable: number;
            thisMonth: number;
        };
        revenue: {
            total: number;
            thisMonth: number;
            completedPayments: number;
        };
        products: {
            total: number;
            active: number;
            withDeposit: number;
        };
        conversionRate: number;
    }>;
}
