import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './audit.entity';
export declare class AuditService {
    private auditRepository;
    constructor(auditRepository: Repository<AuditLog>);
    log(adminId: string, action: AuditAction, entityType: string, entityId: string, options?: {
        previousStatus?: string;
        newStatus?: string;
        reason?: string;
        details?: any;
    }): Promise<AuditLog>;
    findAll(options?: {
        action?: AuditAction;
        entityType?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<[AuditLog[], number]>;
    findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
}
