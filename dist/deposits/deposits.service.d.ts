import { Repository } from 'typeorm';
import { Deposit, DepositStatus } from './deposit.entity';
import { Product } from '../products/product.entity';
import { Raffle } from '../raffles/raffle.entity';
import { Shop } from '../shops/shop.entity';
import { NotificationService } from '../notifications/notification.service';
export declare class DepositsService {
    private depositsRepository;
    private productsRepository;
    private rafflesRepository;
    private shopsRepository;
    private notificationService;
    constructor(depositsRepository: Repository<Deposit>, productsRepository: Repository<Product>, rafflesRepository: Repository<Raffle>, shopsRepository: Repository<Shop>, notificationService: NotificationService);
    /**
     * Calcula si un producto requiere depósito basado en sus dimensiones
     * Máximo permitido: 15x15x15 cm
     */
    calculateDepositRequirement(product: Product): Promise<{
        requiresDeposit: boolean;
        depositAmount: number;
        reason: string;
    }>;
    /**
     * Valida las dimensiones de un producto
     */
    validateDimensions(height: number, width: number, depth: number): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Crea un depósito de garantía para un sorteo
     */
    createDepositForRaffle(raffle: Raffle, product: Product): Promise<Deposit>;
    /**
     * Obtiene todos los depósitos de una tienda
     */
    getDepositsByShop(shopId: string): Promise<Deposit[]>;
    /**
     * Obtiene un depósito por ID
     */
    getDepositById(depositId: string): Promise<Deposit>;
    /**
     * Obtiene depósitos por estado
     */
    getDepositsByStatus(shopId: string, status: DepositStatus): Promise<Deposit[]>;
    /**
     * Libera un depósito (cuando el sorteo se completa exitosamente)
     */
    releaseDeposit(depositId: string, notes?: string): Promise<Deposit>;
    /**
     * Retiene un depósito (cuando hay problemas con la entrega del premio)
     */
    holdDeposit(depositId: string, reason: string): Promise<Deposit>;
    /**
     * Ejecuta un depósito (cuando se confirma la entrega del premio)
     */
    executeDeposit(depositId: string): Promise<Deposit>;
    /**
     * Obtiene estadísticas de depósitos por tienda
     */
    getDepositStatistics(shopId: string): Promise<{
        totalDeposits: number;
        totalAmount: number;
        byStatus: {
            pending: number;
            held: number;
            released: number;
            executed: number;
        };
        amountByStatus: {
            pending: number;
            held: number;
            released: number;
            executed: number;
        };
    }>;
    /**
     * Obtiene depósitos por rango de fechas
     */
    getDepositsByDateRange(shopId: string, startDate: Date, endDate: Date): Promise<Deposit[]>;
}
