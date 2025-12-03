import { DepositsService } from './deposits.service';
export declare class DepositsController {
    private depositsService;
    constructor(depositsService: DepositsService);
    /**
     * Obtiene todos los depósitos de la tienda del usuario
     */
    getMyDeposits(req: any): Promise<import("./deposit.entity").Deposit[]>;
    /**
     * Obtiene depósitos por estado
     */
    getDepositsByStatus(req: any, status: string): Promise<import("./deposit.entity").Deposit[]>;
    /**
     * Obtiene un depósito específico
     */
    getDeposit(id: string): Promise<import("./deposit.entity").Deposit>;
    /**
     * Obtiene estadísticas de depósitos
     */
    getDepositStats(req: any): Promise<{
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
    getDepositsByDateRange(req: any, startDate: string, endDate: string): Promise<import("./deposit.entity").Deposit[]>;
    /**
     * Libera un depósito (solo admin)
     */
    releaseDeposit(id: string, body: {
        notes?: string;
    }): Promise<import("./deposit.entity").Deposit>;
    /**
     * Retiene un depósito (solo admin)
     */
    holdDeposit(id: string, body: {
        reason: string;
    }): Promise<import("./deposit.entity").Deposit>;
    /**
     * Ejecuta un depósito (solo admin)
     */
    executeDeposit(id: string): Promise<import("./deposit.entity").Deposit>;
}
