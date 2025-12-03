import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { AuditAction } from './audit.entity';

@Controller('api/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AuditController {
  constructor(private auditService: AuditService) {}

  /**
   * Obtener todos los logs de auditoría
   */
  @Get()
  async getAllLogs(
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const [logs, total] = await this.auditService.findAll({
      action,
      entityType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    return { logs, total };
  }

  /**
   * Obtener logs de una entidad específica
   */
  @Get('entity/:entityType/:entityId')
  async getEntityLogs(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entityType, entityId);
  }

  /**
   * Exportar logs de auditoría (CSV)
   */
  @Get('export/csv')
  async exportAuditLogs(
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const [logs] = await this.auditService.findAll({
      action,
      entityType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: 10000,
    });

    const headers = ['ID', 'Admin', 'Acción', 'Tipo Entidad', 'ID Entidad', 'Estado Anterior', 'Estado Nuevo', 'Razón', 'Fecha'];
    const rows = logs.map((log) => [
      log.id,
      log.admin?.email || 'N/A',
      log.action,
      log.entityType,
      log.entityId,
      log.previousStatus || 'N/A',
      log.newStatus || 'N/A',
      log.reason || 'N/A',
      log.createdAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return {
      data: csv,
      filename: `auditoria-${new Date().toISOString().split('T')[0]}.csv`,
    };
  }

  /**
   * Obtener estadísticas de auditoría
   */
  @Get('stats/overview')
  async getAuditStats() {
    const [logs] = await this.auditService.findAll({ limit: 10000 });

    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const entityTypeCounts = logs.reduce((acc, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: logs.length,
      actionCounts,
      entityTypeCounts,
      lastLog: logs[0],
    };
  }
}