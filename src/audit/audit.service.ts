import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(
    adminId: string,
    action: AuditAction,
    entityType: string,
    entityId: string,
    options?: {
      previousStatus?: string;
      newStatus?: string;
      reason?: string;
      details?: any;
    },
  ): Promise<AuditLog> {
    const auditLog = this.auditRepository.create({
      adminId,
      action,
      entityType,
      entityId,
      previousStatus: options?.previousStatus,
      newStatus: options?.newStatus,
      reason: options?.reason,
      details: options?.details ? JSON.stringify(options.details) : null,
    });

    return this.auditRepository.save(auditLog);
  }

  async findAll(options?: {
    action?: AuditAction;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<[AuditLog[], number]> {
    const query = this.auditRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.admin', 'admin')
      .orderBy('audit.createdAt', 'DESC');

    if (options?.action) {
      query.andWhere('audit.action = :action', { action: options.action });
    }

    if (options?.entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType: options.entityType });
    }

    if (options?.startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate: options.endDate });
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    query.take(limit).skip(offset);

    return query.getManyAndCount();
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { entityType, entityId },
      relations: ['admin'],
      order: { createdAt: 'DESC' },
    });
  }
}