import { Repository } from 'typeorm';
import { Raffle } from '../raffles/raffle.entity';
import { Shop, ShopStatus } from '../shops/shop.entity';
import { User, UserRole } from '../users/user.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { AuditService } from '../audit/audit.service';
import { RaffleExecutionService } from '../raffles/raffle-execution.service';
export declare class AdminService {
    private rafflesRepository;
    private shopsRepository;
    private usersRepository;
    private paymentsRepository;
    private auditService;
    private raffleExecutionService;
    constructor(rafflesRepository: Repository<Raffle>, shopsRepository: Repository<Shop>, usersRepository: Repository<User>, paymentsRepository: Repository<Payment>, auditService: AuditService, raffleExecutionService: RaffleExecutionService);
    getDashboardStats(): Promise<{
        users: {
            total: number;
        };
        shops: {
            total: number;
            pending: number;
            verified: number;
            blocked: number;
        };
        raffles: {
            pending: number;
            active: number;
            finished: number;
            cancelled: number;
            rejected: number;
        };
        tickets: {
            totalSold: number;
        };
        payments: {
            total: number;
            completed: number;
            pending: number;
            failed: number;
            refunded: number;
            totalRevenue: number;
        };
    }>;
    getPendingRaffles(limit?: number, offset?: number): Promise<{
        data: Raffle[];
        total: number;
    }>;
    getActiveRaffles(limit?: number, offset?: number, filters?: {
        shopId?: string;
    }): Promise<[Raffle[], number]>;
    getFinishedRaffles(limit?: number, offset?: number, filters?: {
        shopId?: string;
    }): Promise<[Raffle[], number]>;
    getRaffleDetail(raffleId: string): Promise<Raffle>;
    approveRaffle(raffleId: string, adminId: string): Promise<Raffle>;
    rejectRaffle(raffleId: string, adminId: string, reason: string): Promise<Raffle>;
    cancelRaffle(raffleId: string, adminId: string, reason: string): Promise<Raffle>;
    executeRaffle(raffleId: string, adminId: string): Promise<Raffle>;
    getAllShops(limit?: number, offset?: number, filters?: {
        status?: ShopStatus;
    }): Promise<[Shop[], number]>;
    getShopDetail(shopId: string): Promise<{
        stats: {
            totalRaffles: number;
            activeRaffles: number;
            finishedRaffles: number;
            cancelledRaffles: number;
        };
        id: string;
        userId: string;
        user: User;
        name: string;
        description: string;
        logo: string;
        publicEmail: string;
        phone: string;
        socialMedia: string;
        status: ShopStatus;
        createdAt: Date;
        updatedAt: Date;
        products: import("../products/product.entity").Product[];
        raffles: Raffle[];
        deposits: import("../deposits/deposit.entity").Deposit[];
    }>;
    changeShopStatus(shopId: string, newStatus: ShopStatus, adminId: string, reason?: string): Promise<{
        stats: {
            totalRaffles: number;
            activeRaffles: number;
            finishedRaffles: number;
            cancelledRaffles: number;
        };
        id: string;
        userId: string;
        user: User;
        name: string;
        description: string;
        logo: string;
        publicEmail: string;
        phone: string;
        socialMedia: string;
        status: ShopStatus;
        createdAt: Date;
        updatedAt: Date;
        products: import("../products/product.entity").Product[];
        raffles: Raffle[];
        deposits: import("../deposits/deposit.entity").Deposit[];
    } & Shop>;
    getAllUsers(limit?: number, offset?: number, filters?: {
        role?: UserRole;
    }): Promise<[User[], number]>;
    getUserDetail(userId: string): Promise<{
        additionalInfo: {};
        id: string;
        name: string;
        email: string;
        password: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllPayments(limit?: number, offset?: number, filters?: {
        status?: PaymentStatus;
        userId?: string;
        raffleId?: string;
    }): Promise<[Payment[], number]>;
    getPaymentDetail(paymentId: string): Promise<Payment>;
}
