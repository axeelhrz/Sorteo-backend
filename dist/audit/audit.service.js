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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_entity_1 = require("./audit.entity");
let AuditService = class AuditService {
    constructor(auditRepository) {
        this.auditRepository = auditRepository;
    }
    async log(adminId, action, entityType, entityId, options) {
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
    async findAll(options) {
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
    async findByEntity(entityType, entityId) {
        return this.auditRepository.find({
            where: { entityType, entityId },
            relations: ['admin'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
