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
exports.ComplaintsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const complaint_entity_1 = require("./complaint.entity");
const complaint_message_entity_1 = require("./complaint-message.entity");
const complaint_attachment_entity_1 = require("./complaint-attachment.entity");
const audit_service_1 = require("../audit/audit.service");
let ComplaintsService = class ComplaintsService {
    constructor(complaintRepository, messageRepository, attachmentRepository, auditService) {
        this.complaintRepository = complaintRepository;
        this.messageRepository = messageRepository;
        this.attachmentRepository = attachmentRepository;
        this.auditService = auditService;
    }
    /**
     * Generar número de reclamo único consecutivo
     */
    async generateComplaintNumber() {
        const lastComplaint = await this.complaintRepository.findOne({
            order: { createdAt: 'DESC' },
        });
        let nextNumber = 1;
        if (lastComplaint && lastComplaint.complaintNumber) {
            const lastNumber = parseInt(lastComplaint.complaintNumber.split('-')[1], 10);
            nextNumber = lastNumber + 1;
        }
        return `COMP-${String(nextNumber).padStart(6, '0')}`;
    }
    /**
     * Crear un nuevo reclamo
     */
    async createComplaint(userId, dto) {
        const complaintNumber = await this.generateComplaintNumber();
        // Calcular fecha máxima de respuesta (30 días)
        const maxResponseDate = new Date();
        maxResponseDate.setDate(maxResponseDate.getDate() + 30);
        const complaint = this.complaintRepository.create({
            complaintNumber,
            userId,
            type: dto.type,
            description: dto.description,
            raffleId: dto.raffleId,
            shopId: dto.shopId,
            paymentId: dto.paymentId,
            status: complaint_entity_1.ComplaintStatus.PENDING,
            maxResponseDate,
        });
        const saved = await this.complaintRepository.save(complaint);
        // Registrar en auditoría
        await this.auditService.log(userId, 'complaint_created', 'complaint', saved.id, {
            details: {
                complaintNumber: saved.complaintNumber,
                type: saved.type,
                raffleId: saved.raffleId,
                shopId: saved.shopId,
            },
        });
        return saved;
    }
    /**
     * Obtener reclamo por ID
     */
    async getComplaintById(id) {
        const complaint = await this.complaintRepository.findOne({
            where: { id },
            relations: ['user', 'shop', 'raffle', 'payment', 'assignedAdmin', 'messages', 'messages.sender', 'attachments', 'attachments.uploader'],
        });
        if (!complaint) {
            throw new common_1.NotFoundException('Reclamo no encontrado');
        }
        return complaint;
    }
    /**
     * Obtener reclamos del usuario
     */
    async getUserComplaints(userId, options) {
        const query = this.complaintRepository.createQueryBuilder('complaint')
            .where('complaint.userId = :userId', { userId })
            .leftJoinAndSelect('complaint.shop', 'shop')
            .leftJoinAndSelect('complaint.raffle', 'raffle')
            .leftJoinAndSelect('complaint.assignedAdmin', 'admin')
            .orderBy('complaint.createdAt', 'DESC');
        if (options?.status) {
            query.andWhere('complaint.status = :status', { status: options.status });
        }
        if (options?.type) {
            query.andWhere('complaint.type = :type', { type: options.type });
        }
        const limit = options?.limit || 10;
        const offset = options?.offset || 0;
        query.take(limit).skip(offset);
        return query.getManyAndCount();
    }
    /**
     * Obtener reclamos de una tienda
     */
    async getShopComplaints(shopId, options) {
        const query = this.complaintRepository.createQueryBuilder('complaint')
            .where('complaint.shopId = :shopId', { shopId })
            .leftJoinAndSelect('complaint.user', 'user')
            .leftJoinAndSelect('complaint.raffle', 'raffle')
            .leftJoinAndSelect('complaint.assignedAdmin', 'admin')
            .orderBy('complaint.createdAt', 'DESC');
        if (options?.status) {
            query.andWhere('complaint.status = :status', { status: options.status });
        }
        const limit = options?.limit || 10;
        const offset = options?.offset || 0;
        query.take(limit).skip(offset);
        return query.getManyAndCount();
    }
    /**
     * Obtener todos los reclamos (admin)
     */
    async getAllComplaints(options) {
        const query = this.complaintRepository.createQueryBuilder('complaint')
            .leftJoinAndSelect('complaint.user', 'user')
            .leftJoinAndSelect('complaint.shop', 'shop')
            .leftJoinAndSelect('complaint.raffle', 'raffle')
            .leftJoinAndSelect('complaint.assignedAdmin', 'admin')
            .orderBy('complaint.createdAt', 'DESC');
        if (options?.status) {
            query.andWhere('complaint.status = :status', { status: options.status });
        }
        if (options?.type) {
            query.andWhere('complaint.type = :type', { type: options.type });
        }
        if (options?.shopId) {
            query.andWhere('complaint.shopId = :shopId', { shopId: options.shopId });
        }
        if (options?.raffleId) {
            query.andWhere('complaint.raffleId = :raffleId', { raffleId: options.raffleId });
        }
        if (options?.startDate) {
            query.andWhere('complaint.createdAt >= :startDate', { startDate: options.startDate });
        }
        if (options?.endDate) {
            query.andWhere('complaint.createdAt <= :endDate', { endDate: options.endDate });
        }
        const limit = options?.limit || 20;
        const offset = options?.offset || 0;
        query.take(limit).skip(offset);
        return query.getManyAndCount();
    }
    /**
     * Actualizar reclamo (admin)
     */
    async updateComplaint(id, adminId, dto) {
        const complaint = await this.getComplaintById(id);
        const oldStatus = complaint.status;
        if (dto.status) {
            complaint.status = dto.status;
        }
        if (dto.resolution) {
            complaint.resolution = dto.resolution;
            complaint.resolvedAt = new Date();
        }
        if (dto.resolutionNotes) {
            complaint.resolutionNotes = dto.resolutionNotes;
        }
        if (dto.assignedAdminId) {
            complaint.assignedAdminId = dto.assignedAdminId;
        }
        const updated = await this.complaintRepository.save(complaint);
        // Registrar en auditoría
        await this.auditService.log(adminId, 'complaint_updated', 'complaint', id, {
            previousStatus: oldStatus,
            newStatus: complaint.status,
            details: {
                resolution: complaint.resolution,
                resolutionNotes: complaint.resolutionNotes,
            },
        });
        return updated;
    }
    /**
     * Agregar mensaje al reclamo
     */
    async addMessage(complaintId, senderId, senderType, dto) {
        const complaint = await this.getComplaintById(complaintId);
        // Cambiar estado a IN_REVIEW si está en PENDING
        if (complaint.status === complaint_entity_1.ComplaintStatus.PENDING) {
            complaint.status = complaint_entity_1.ComplaintStatus.IN_REVIEW;
            await this.complaintRepository.save(complaint);
        }
        const message = this.messageRepository.create({
            complaintId,
            senderId,
            senderType,
            message: dto.message,
        });
        return this.messageRepository.save(message);
    }
    /**
     * Obtener mensajes del reclamo
     */
    async getMessages(complaintId) {
        return this.messageRepository.find({
            where: { complaintId },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });
    }
    /**
     * Agregar adjunto al reclamo
     */
    async addAttachment(complaintId, uploadedBy, fileName, fileUrl, fileType, fileSize, description) {
        await this.getComplaintById(complaintId);
        const attachment = this.attachmentRepository.create({
            complaintId,
            uploadedBy,
            fileName,
            fileUrl,
            fileType,
            fileSize,
            description,
        });
        return this.attachmentRepository.save(attachment);
    }
    /**
     * Obtener adjuntos del reclamo
     */
    async getAttachments(complaintId) {
        return this.attachmentRepository.find({
            where: { complaintId },
            relations: ['uploader'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Cancelar reclamo (usuario)
     */
    async cancelComplaint(id, userId) {
        const complaint = await this.getComplaintById(id);
        if (complaint.userId !== userId) {
            throw new common_1.ForbiddenException('No tienes permiso para cancelar este reclamo');
        }
        if (complaint.status === complaint_entity_1.ComplaintStatus.RESOLVED || complaint.status === complaint_entity_1.ComplaintStatus.REJECTED) {
            throw new common_1.BadRequestException('No puedes cancelar un reclamo ya resuelto');
        }
        complaint.status = complaint_entity_1.ComplaintStatus.CANCELLED;
        complaint.resolution = complaint_entity_1.ComplaintResolution.CANCELLED;
        return this.complaintRepository.save(complaint);
    }
    /**
     * Exportar libro de reclamaciones (CSV)
     */
    async exportComplaints(options) {
        const [complaints] = await this.getAllComplaints({
            ...options,
            limit: 10000,
        });
        const headers = ['ID Reclamo', 'Usuario', 'Fecha', 'Tipo', 'Estado', 'Resolución', 'Tienda', 'Sorteo', 'Fecha Máxima Respuesta', 'Resuelto En'];
        const rows = complaints.map((c) => [
            c.complaintNumber,
            c.user?.email || 'N/A',
            c.createdAt.toISOString(),
            c.type,
            c.status,
            c.resolution || 'N/A',
            c.shop?.name || 'N/A',
            c.raffle?.id || 'N/A',
            c.maxResponseDate?.toISOString() || 'N/A',
            c.resolvedAt?.toISOString() || 'N/A',
        ]);
        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');
        return csv;
    }
    /**
     * Obtener estadísticas de reclamos
     */
    async getComplaintStats() {
        const total = await this.complaintRepository.count();
        const pending = await this.complaintRepository.count({ where: { status: complaint_entity_1.ComplaintStatus.PENDING } });
        const inReview = await this.complaintRepository.count({ where: { status: complaint_entity_1.ComplaintStatus.IN_REVIEW } });
        const resolved = await this.complaintRepository.count({ where: { status: complaint_entity_1.ComplaintStatus.RESOLVED } });
        const rejected = await this.complaintRepository.count({ where: { status: complaint_entity_1.ComplaintStatus.REJECTED } });
        const byType = await this.complaintRepository
            .createQueryBuilder('complaint')
            .select('complaint.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('complaint.type')
            .getRawMany();
        return {
            total,
            pending,
            inReview,
            resolved,
            rejected,
            byType,
        };
    }
};
exports.ComplaintsService = ComplaintsService;
exports.ComplaintsService = ComplaintsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(complaint_entity_1.Complaint)),
    __param(1, (0, typeorm_1.InjectRepository)(complaint_message_entity_1.ComplaintMessage)),
    __param(2, (0, typeorm_1.InjectRepository)(complaint_attachment_entity_1.ComplaintAttachment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], ComplaintsService);
