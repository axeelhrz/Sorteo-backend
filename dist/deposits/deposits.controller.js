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
exports.DepositsController = void 0;
const common_1 = require("@nestjs/common");
const deposits_service_1 = require("./deposits.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let DepositsController = class DepositsController {
    constructor(depositsService) {
        this.depositsService = depositsService;
    }
    /**
     * Obtiene todos los depósitos de la tienda del usuario
     */
    async getMyDeposits(req) {
        return this.depositsService.getDepositsByShop(req.user.shopId);
    }
    /**
     * Obtiene depósitos por estado
     */
    async getDepositsByStatus(req, status) {
        return this.depositsService.getDepositsByStatus(req.user.shopId, status);
    }
    /**
     * Obtiene un depósito específico
     */
    async getDeposit(id) {
        return this.depositsService.getDepositById(id);
    }
    /**
     * Obtiene estadísticas de depósitos
     */
    async getDepositStats(req) {
        return this.depositsService.getDepositStatistics(req.user.shopId);
    }
    /**
     * Obtiene depósitos por rango de fechas
     */
    async getDepositsByDateRange(req, startDate, endDate) {
        return this.depositsService.getDepositsByDateRange(req.user.shopId, new Date(startDate), new Date(endDate));
    }
    /**
     * Libera un depósito (solo admin)
     */
    async releaseDeposit(id, body) {
        return this.depositsService.releaseDeposit(id, body.notes);
    }
    /**
     * Retiene un depósito (solo admin)
     */
    async holdDeposit(id, body) {
        return this.depositsService.holdDeposit(id, body.reason);
    }
    /**
     * Ejecuta un depósito (solo admin)
     */
    async executeDeposit(id) {
        return this.depositsService.executeDeposit(id);
    }
};
exports.DepositsController = DepositsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "getMyDeposits", null);
__decorate([
    (0, common_1.Get)('by-status/:status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "getDepositsByStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "getDeposit", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "getDepositStats", null);
__decorate([
    (0, common_1.Get)('range/by-date'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "getDepositsByDateRange", null);
__decorate([
    (0, common_1.Put)(':id/release'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "releaseDeposit", null);
__decorate([
    (0, common_1.Put)(':id/hold'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "holdDeposit", null);
__decorate([
    (0, common_1.Put)(':id/execute'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "executeDeposit", null);
exports.DepositsController = DepositsController = __decorate([
    (0, common_1.Controller)('api/deposits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [deposits_service_1.DepositsService])
], DepositsController);
