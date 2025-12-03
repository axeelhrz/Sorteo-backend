"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const audit_service_1 = require("./audit.service");
const audit_entity_1 = require("./audit.entity");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    /**
     * Obtener todos los logs de auditoría
     */
    async getAllLogs(action, entityType, startDate, endDate, limit, offset) {
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
    async getEntityLogs(entityType, entityId) {
        return this.auditService.findByEntity(entityType, entityId);
    }
    /**
     * Exportar logs de auditoría (CSV)
     */
    async exportAuditLogs(action, entityType, startDate, endDate) {
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
    async getAuditStats() {
        const [logs] = await this.auditService.findAll({ limit: 10000 });
        const actionCounts = logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {});
        const entityTypeCounts = logs.reduce((acc, log) => {
            acc[log.entityType] = (acc[log.entityType] || 0) + 1;
            return acc;
        }, {});
        return {
            totalLogs: logs.length,
            actionCounts,
            entityTypeCounts,
            lastLog: logs[0],
        };
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('action')),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAllLogs", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    __param(0, (0, common_1.Query)('entityType')),
    __param(1, (0, common_1.Query)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getEntityLogs", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    __param(0, (0, common_1.Query)('action')),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "exportAuditLogs", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditStats", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('api/audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
