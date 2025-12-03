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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const audit_service_1 = require("../audit/audit.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const shop_entity_1 = require("../shops/shop.entity");
const user_entity_1 = require("../users/user.entity");
const payment_entity_1 = require("../payments/payment.entity");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let AdminController = class AdminController {
    constructor(adminService, auditService) {
        this.adminService = adminService;
        this.auditService = auditService;
    }
    // ============ DASHBOARD ============
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    // ============ RAFFLES ============
    async getPendingRaffles(limit, offset) {
        return this.adminService.getPendingRaffles(limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0);
    }
    async getActiveRaffles(limit, offset, shopId) {
        const [data, total] = await this.adminService.getActiveRaffles(limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0, shopId ? { shopId } : undefined);
        return { data, total };
    }
    async getFinishedRaffles(limit, offset, shopId) {
        const [data, total] = await this.adminService.getFinishedRaffles(limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0, shopId ? { shopId } : undefined);
        return { data, total };
    }
    async getRaffleDetail(id) {
        return this.adminService.getRaffleDetail(id);
    }
    async approveRaffle(id, user) {
        return this.adminService.approveRaffle(id, user.id);
    }
    async rejectRaffle(id, body, user) {
        if (!body.reason || body.reason.trim().length === 0) {
            throw new common_1.BadRequestException('El motivo del rechazo es requerido');
        }
        return this.adminService.rejectRaffle(id, user.id, body.reason);
    }
    async cancelRaffle(id, body, user) {
        if (!body.reason || body.reason.trim().length === 0) {
            throw new common_1.BadRequestException('El motivo de la cancelación es requerido');
        }
        return this.adminService.cancelRaffle(id, user.id, body.reason);
    }
    async executeRaffle(id, user) {
        return this.adminService.executeRaffle(id, user.id);
    }
    // ============ SHOPS ============
    async getAllShops(limit, offset, status) {
        const [data, total] = await this.adminService.getAllShops(limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0, status ? { status } : undefined);
        return { data, total };
    }
    async getShopDetail(id) {
        return this.adminService.getShopDetail(id);
    }
    async changeShopStatus(id, body, user) {
        if (!body.status) {
            throw new common_1.BadRequestException('El estado es requerido');
        }
        return this.adminService.changeShopStatus(id, body.status, user.id, body.reason);
    }
    // ============ USERS ============
    async getAllUsers(limit, offset, role) {
        const [data, total] = await this.adminService.getAllUsers(limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0, role ? { role } : undefined);
        return { data, total };
    }
    async getUserDetail(id) {
        return this.adminService.getUserDetail(id);
    }
    // ============ AUDIT ============
    async getAuditLogs(action, entityType, startDate, endDate, limit, offset) {
        const [data, total] = await this.auditService.findAll({
            action: action,
            entityType,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
        return { data, total };
    }
    async getEntityAuditLogs(entityType, entityId) {
        return this.auditService.findByEntity(entityType, entityId);
    }
    // ============ PAYMENTS ============
    async getAllPayments(limit, offset, status, userId, raffleId) {
        const [data, total] = await this.adminService.getAllPayments(limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0, {
            status,
            userId,
            raffleId,
        });
        return { data, total };
    }
    async getPaymentDetail(id) {
        return this.adminService.getPaymentDetail(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('raffles/pending'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingRaffles", null);
__decorate([
    (0, common_1.Get)('raffles/active'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getActiveRaffles", null);
__decorate([
    (0, common_1.Get)('raffles/finished'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFinishedRaffles", null);
__decorate([
    (0, common_1.Get)('raffles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRaffleDetail", null);
__decorate([
    (0, common_1.Put)('raffles/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveRaffle", null);
__decorate([
    (0, common_1.Put)('raffles/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectRaffle", null);
__decorate([
    (0, common_1.Put)('raffles/:id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "cancelRaffle", null);
__decorate([
    (0, common_1.Put)('raffles/:id/execute'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "executeRaffle", null);
__decorate([
    (0, common_1.Get)('shops'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllShops", null);
__decorate([
    (0, common_1.Get)('shops/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getShopDetail", null);
__decorate([
    (0, common_1.Put)('shops/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeShopStatus", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.Get)('audit/logs'),
    __param(0, (0, common_1.Query)('action')),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('audit/entity/:entityType/:entityId'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getEntityAuditLogs", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('raffleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllPayments", null);
__decorate([
    (0, common_1.Get)('payments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPaymentDetail", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('api/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        audit_service_1.AuditService])
], AdminController);
