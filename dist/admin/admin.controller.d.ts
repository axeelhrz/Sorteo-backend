import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { ShopStatus } from '../shops/shop.entity';
import { UserRole } from '../users/user.entity';
import { PaymentStatus } from '../payments/payment.entity';
export declare class AdminController {
    private readonly adminService;
    private readonly auditService;
    constructor(adminService: AdminService, auditService: AuditService);
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
    getPendingRaffles(limit?: string, offset?: string): Promise<{
        data: import("../raffles/raffle.entity").Raffle[];
        total: number;
    }>;
    getActiveRaffles(limit?: string, offset?: string, shopId?: string): Promise<{
        data: import("../raffles/raffle.entity").Raffle[];
        total: number;
    }>;
    getFinishedRaffles(limit?: string, offset?: string, shopId?: string): Promise<{
        data: import("../raffles/raffle.entity").Raffle[];
        total: number;
    }>;
    getRaffleDetail(id: string): Promise<import("../raffles/raffle.entity").Raffle>;
    approveRaffle(id: string, user: any): Promise<import("../raffles/raffle.entity").Raffle>;
    rejectRaffle(id: string, body: {
        reason: string;
    }, user: any): Promise<import("../raffles/raffle.entity").Raffle>;
    cancelRaffle(id: string, body: {
        reason: string;
    }, user: any): Promise<import("../raffles/raffle.entity").Raffle>;
    executeRaffle(id: string, user: any): Promise<import("../raffles/raffle.entity").Raffle>;
    getAllShops(limit?: string, offset?: string, status?: ShopStatus): Promise<{
        data: import("../shops/shop.entity").Shop[];
        total: number;
    }>;
    getShopDetail(id: string): Promise<{
        stats: {
            totalRaffles: number;
            activeRaffles: number;
            finishedRaffles: number;
            cancelledRaffles: number;
        };
        id: string;
        userId: string;
        user: import("../users/user.entity").User;
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
        raffles: import("../raffles/raffle.entity").Raffle[];
        deposits: import("../deposits/deposit.entity").Deposit[];
    }>;
    changeShopStatus(id: string, body: {
        status: ShopStatus;
        reason?: string;
    }, user: any): Promise<{
        stats: {
            totalRaffles: number;
            activeRaffles: number;
            finishedRaffles: number;
            cancelledRaffles: number;
        };
        id: string;
        userId: string;
        user: import("../users/user.entity").User;
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
        raffles: import("../raffles/raffle.entity").Raffle[];
        deposits: import("../deposits/deposit.entity").Deposit[];
    } & import("../shops/shop.entity").Shop>;
    getAllUsers(limit?: string, offset?: string, role?: UserRole): Promise<{
        data: import("../users/user.entity").User[];
        total: number;
    }>;
    getUserDetail(id: string): Promise<{
        additionalInfo: {};
        id: string;
        name: string;
        email: string;
        password: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAuditLogs(action?: string, entityType?: string, startDate?: string, endDate?: string, limit?: string, offset?: string): Promise<{
        data: import("../audit/audit.entity").AuditLog[];
        total: number;
    }>;
    getEntityAuditLogs(entityType: string, entityId: string): Promise<import("../audit/audit.entity").AuditLog[]>;
    getAllPayments(limit?: string, offset?: string, status?: PaymentStatus, userId?: string, raffleId?: string): Promise<{
        data: import("../payments/payment.entity").Payment[];
        total: number;
    }>;
    getPaymentDetail(id: string): Promise<import("../payments/payment.entity").Payment>;
}
