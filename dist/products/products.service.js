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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
const shop_entity_1 = require("../shops/shop.entity");
let ProductsService = class ProductsService {
    constructor(productsRepository, shopsRepository) {
        this.productsRepository = productsRepository;
        this.shopsRepository = shopsRepository;
    }
    async create(createProductDto) {
        // Validar que la tienda existe
        const shop = await this.shopsRepository.findOne({
            where: { id: createProductDto.shopId },
        });
        if (!shop) {
            throw new common_1.BadRequestException('Tienda no encontrada');
        }
        // Calcular si requiere depósito (si alguna dimensión > 15 cm)
        const requiresDeposit = createProductDto.height > 15 ||
            createProductDto.width > 15 ||
            createProductDto.depth > 15;
        // Crear el producto
        const product = this.productsRepository.create({
            ...createProductDto,
            requiresDeposit,
            status: product_entity_1.ProductStatus.ACTIVE,
        });
        return this.productsRepository.save(product);
    }
    async findAll() {
        return this.productsRepository.find({
            relations: ['shop', 'raffles'],
        });
    }
    async findById(id) {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['shop', 'raffles'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return product;
    }
    async findByShopId(shopId) {
        return this.productsRepository.find({
            where: { shopId },
            relations: ['raffles'],
        });
    }
    async findActiveByShopId(shopId) {
        return this.productsRepository.find({
            where: { shopId, status: product_entity_1.ProductStatus.ACTIVE },
            relations: ['raffles'],
        });
    }
    async findActive() {
        return this.productsRepository.find({
            where: { status: product_entity_1.ProductStatus.ACTIVE },
            relations: ['shop', 'raffles'],
        });
    }
    async update(id, updateData) {
        const product = await this.findById(id);
        // Si se actualizan dimensiones, recalcular requiresDeposit
        if (updateData.height || updateData.width || updateData.depth) {
            const height = updateData.height || product.height;
            const width = updateData.width || product.width;
            const depth = updateData.depth || product.depth;
            product.requiresDeposit = height > 15 || width > 15 || depth > 15;
        }
        Object.assign(product, updateData);
        return this.productsRepository.save(product);
    }
    async updateStatus(id, status) {
        const product = await this.findById(id);
        product.status = status;
        return this.productsRepository.save(product);
    }
    async deactivate(id) {
        return this.updateStatus(id, product_entity_1.ProductStatus.INACTIVE);
    }
    async archive(id) {
        return this.updateStatus(id, product_entity_1.ProductStatus.ARCHIVED);
    }
    async delete(id) {
        const product = await this.findById(id);
        // Validar que no tenga sorteos activos
        const activeRaffles = product.raffles?.filter((r) => r.status === 'active');
        if (activeRaffles && activeRaffles.length > 0) {
            throw new common_1.BadRequestException('No se puede eliminar un producto con sorteos activos');
        }
        await this.productsRepository.remove(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
