import { AuditService } from './audit.service';
import { AuditAction } from './audit.entity';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    /**
     * Obtener todos los logs de auditoría
     */
    getAllLogs(action?: AuditAction, entityType?: string, startDate?: string, endDate?: string, limit?: string, offset?: string): Promise<{
        logs: import("./audit.entity").AuditLog[];
        total: number;
    }>;
    /**
     * Obtener logs de una entidad específica
     */
    getEntityLogs(entityType: string, entityId: string): Promise<import("./audit.entity").AuditLog[]>;
    /**
     * Exportar logs de auditoría (CSV)
     */
    exportAuditLogs(action?: AuditAction, entityType?: string, startDate?: string, endDate?: string): Promise<{
        data: string;
        filename: string;
    }>;
    /**
     * Obtener estadísticas de auditoría
     */
    getAuditStats(): Promise<{
        totalLogs: number;
        actionCounts: Record<string, number>;
        entityTypeCounts: Record<string, number>;
        lastLog: import("./audit.entity").AuditLog;
    }>;
}
