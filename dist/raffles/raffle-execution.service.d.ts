import { Repository, DataSource } from 'typeorm';
import { Raffle } from './raffle.entity';
import { RaffleTicket } from '../raffle-tickets/raffle-ticket.entity';
import { AuditService } from '../audit/audit.service';
export declare class RaffleExecutionService {
    private rafflesRepository;
    private ticketsRepository;
    private auditService;
    private dataSource;
    private executingRaffles;
    constructor(rafflesRepository: Repository<Raffle>, ticketsRepository: Repository<RaffleTicket>, auditService: AuditService, dataSource: DataSource);
    /**
     * Ejecutar sorteo de forma segura con lock transaccional
     * Previene doble ejecución y garantiza consistencia
     */
    executeRaffleSecurely(raffleId: string, adminId: string): Promise<Raffle>;
    /**
     * Ejecutar automáticamente un sorteo cuando todos los tickets están vendidos
     * Este método se llama automáticamente cuando un sorteo pasa a sold_out
     */
    autoExecuteWhenSoldOut(raffleId: string): Promise<Raffle | null>;
    /**
     * Validar consistencia de tickets antes de ejecutar
     */
    validateTicketConsistency(raffleId: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
}
