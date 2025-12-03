import { RafflesService } from './raffles.service';
import { Raffle } from './raffle.entity';
export declare class RafflesController {
    private readonly rafflesService;
    constructor(rafflesService: RafflesService);
    findPublicActive(search?: string, category?: string, shopId?: string, minValue?: string, maxValue?: string, status?: string, sortBy?: string, page?: string, limit?: string): Promise<{
        data: Raffle[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getPublicCategories(): Promise<string[]>;
    getPublicShops(): Promise<any[]>;
    getPublicRafflesByShop(shopId: string, search?: string, sortBy?: string, page?: string, limit?: string): Promise<{
        data: Raffle[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findPublicOne(id: string): Promise<Raffle>;
    create(body: any): Promise<Raffle>;
    findAll(shopId?: string): Promise<Raffle[]>;
    findActive(): Promise<Raffle[]>;
    getMyRaffles(): Promise<Raffle[]>;
    findOne(id: string): Promise<Raffle>;
    approve(id: string): Promise<Raffle>;
    reject(id: string): Promise<Raffle>;
    submitForApproval(id: string): Promise<Raffle>;
    cancel(id: string): Promise<Raffle>;
    pause(id: string): Promise<Raffle>;
    resume(id: string): Promise<Raffle>;
    executeRaffle(id: string, body: {
        winnerTicketId: string;
    }): Promise<Raffle>;
    remove(id: string): Promise<void>;
}
