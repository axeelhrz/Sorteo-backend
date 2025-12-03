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
exports.RafflesController = void 0;
const common_1 = require("@nestjs/common");
const raffles_service_1 = require("./raffles.service");
const create_raffle_dto_1 = require("./dto/create-raffle.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let RafflesController = class RafflesController {
    constructor(rafflesService) {
        this.rafflesService = rafflesService;
    }
    // Rutas públicas específicas deben ir ANTES de todas las demás rutas
    async findPublicActive(search, category, shopId, minValue, maxValue, status, sortBy, page, limit) {
        return this.rafflesService.findPublicActive({
            search,
            category,
            shopId,
            minValue: minValue ? parseFloat(minValue) : undefined,
            maxValue: maxValue ? parseFloat(maxValue) : undefined,
            status: status,
            sortBy: sortBy,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 12,
        });
    }
    async getPublicCategories() {
        return this.rafflesService.getCategories();
    }
    async getPublicShops() {
        return this.rafflesService.getShopsWithActiveRaffles();
    }
    async getPublicRafflesByShop(shopId, search, sortBy, page, limit) {
        return this.rafflesService.findPublicActive({
            shopId,
            search,
            sortBy: sortBy,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 12,
        });
    }
    async findPublicOne(id) {
        return this.rafflesService.findById(id);
    }
    async create(body) {
        // Crear instancia del DTO con todos los campos, incluyendo totalTickets
        const createRaffleDto = (0, class_transformer_1.plainToInstance)(create_raffle_dto_1.CreateRaffleDto, body);
        // Validar el DTO
        const errors = await (0, class_validator_1.validate)(createRaffleDto, {
            whitelist: true,
            forbidNonWhitelisted: false,
        });
        if (errors.length > 0) {
            const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
            throw new common_1.BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
        }
        return this.rafflesService.create(createRaffleDto);
    }
    async findAll(shopId) {
        if (shopId) {
            return this.rafflesService.findByShopId(shopId);
        }
        return this.rafflesService.findAll();
    }
    async findActive() {
        return this.rafflesService.findActive();
    }
    async getMyRaffles() {
        // This endpoint will be called with the shop ID from the frontend
        // The frontend should pass the shopId as a query parameter
        return [];
    }
    async findOne(id) {
        return this.rafflesService.findById(id);
    }
    async approve(id) {
        return this.rafflesService.approve(id);
    }
    async reject(id) {
        return this.rafflesService.reject(id);
    }
    async submitForApproval(id) {
        return this.rafflesService.submitForApproval(id);
    }
    async cancel(id) {
        return this.rafflesService.cancel(id);
    }
    async pause(id) {
        return this.rafflesService.pause(id);
    }
    async resume(id) {
        return this.rafflesService.resume(id);
    }
    async executeRaffle(id, body) {
        return this.rafflesService.executeRaffle(id, body.winnerTicketId);
    }
    async remove(id) {
        return this.rafflesService.delete(id);
    }
};
exports.RafflesController = RafflesController;
__decorate([
    (0, common_1.Get)('public/active'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('shopId')),
    __param(3, (0, common_1.Query)('minValue')),
    __param(4, (0, common_1.Query)('maxValue')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('page')),
    __param(8, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "findPublicActive", null);
__decorate([
    (0, common_1.Get)('public/categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "getPublicCategories", null);
__decorate([
    (0, common_1.Get)('public/shops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "getPublicShops", null);
__decorate([
    (0, common_1.Get)('public/shop/:shopId'),
    __param(0, (0, common_1.Param)('shopId')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('sortBy')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "getPublicRafflesByShop", null);
__decorate([
    (0, common_1.Get)('public/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "findPublicOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop', 'admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('shop/my-raffles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "getMyRaffles", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "approve", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "reject", null);
__decorate([
    (0, common_1.Put)(':id/submit-approval'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "submitForApproval", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "cancel", null);
__decorate([
    (0, common_1.Put)(':id/pause'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "pause", null);
__decorate([
    (0, common_1.Put)(':id/resume'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "resume", null);
__decorate([
    (0, common_1.Put)(':id/execute'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "executeRaffle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "remove", null);
exports.RafflesController = RafflesController = __decorate([
    (0, common_1.Controller)('api/raffles'),
    __metadata("design:paramtypes", [raffles_service_1.RafflesService])
], RafflesController);
