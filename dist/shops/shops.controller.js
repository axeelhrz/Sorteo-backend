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
exports.ShopsController = void 0;
const common_1 = require("@nestjs/common");
const shops_service_1 = require("./shops.service");
const create_shop_dto_1 = require("./dto/create-shop.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let ShopsController = class ShopsController {
    constructor(shopsService) {
        this.shopsService = shopsService;
    }
    async create(createShopDto) {
        return this.shopsService.create(createShopDto);
    }
    async findAll() {
        return this.shopsService.findAll();
    }
    async findVerified() {
        return this.shopsService.findVerified();
    }
    async getMyShop(req) {
        try {
            console.log(`🔍 Buscando tienda para usuario: ${req.user.id} (${req.user.name})`);
            const shops = await this.shopsService.findByUserId(req.user.id);
            console.log(`📦 Tiendas encontradas: ${shops?.length || 0}`);
            if (!shops || shops.length === 0) {
                // Si no existe una tienda, crearla automáticamente usando el nombre del usuario
                console.log(`⚠️  No se encontró tienda, creando automáticamente...`);
                const shop = await this.shopsService.getOrCreateShopForUser(req.user.id, req.user.name);
                console.log(`✅ Tienda creada/obtenida: ${shop.id} - ${shop.name}`);
                return shop;
            }
            console.log(`✅ Tienda encontrada: ${shops[0].id} - ${shops[0].name}`);
            return shops[0];
        }
        catch (error) {
            console.error('❌ Error en getMyShop:', error);
            throw error;
        }
    }
    async findByUserId(userId) {
        return this.shopsService.findByUserId(userId);
    }
    async getStatistics(id, req) {
        // Validar que el usuario solo puede ver estadísticas de su propia tienda
        if (req.user.role === 'shop') {
            const shops = await this.shopsService.findByUserId(req.user.id);
            if (!shops.some((s) => s.id === id)) {
                throw new common_1.NotFoundException('No tienes permiso para ver estas estadísticas');
            }
        }
        return this.shopsService.getShopStatistics(id);
    }
    async findById(id) {
        return this.shopsService.findById(id);
    }
    async update(id, updateData) {
        return this.shopsService.update(id, updateData);
    }
    async verify(id) {
        return this.shopsService.verify(id);
    }
    async block(id) {
        return this.shopsService.block(id);
    }
    async delete(id) {
        return this.shopsService.delete(id);
    }
};
exports.ShopsController = ShopsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'shop'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shop_dto_1.CreateShopDto]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('verified'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "findVerified", null);
__decorate([
    (0, common_1.Get)('my-shop/current'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "getMyShop", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'shop'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "verify", null);
__decorate([
    (0, common_1.Put)(':id/block'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "block", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "delete", null);
exports.ShopsController = ShopsController = __decorate([
    (0, common_1.Controller)('api/shops'),
    __metadata("design:paramtypes", [shops_service_1.ShopsService])
], ShopsController);
