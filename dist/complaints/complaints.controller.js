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
exports.ComplaintsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const complaints_service_1 = require("./complaints.service");
const create_complaint_dto_1 = require("./dto/create-complaint.dto");
const update_complaint_dto_1 = require("./dto/update-complaint.dto");
const add_message_dto_1 = require("./dto/add-message.dto");
const complaint_message_entity_1 = require("./complaint-message.entity");
const complaint_entity_1 = require("./complaint.entity");
let ComplaintsController = class ComplaintsController {
    constructor(complaintsService) {
        this.complaintsService = complaintsService;
    }
    /**
     * Crear un nuevo reclamo (usuario)
     */
    async createComplaint(req, dto) {
        return this.complaintsService.createComplaint(req.user.id, dto);
    }
    /**
     * Obtener reclamo por ID
     */
    async getComplaint(id) {
        return this.complaintsService.getComplaintById(id);
    }
    /**
     * Obtener reclamos del usuario autenticado
     */
    async getUserComplaints(req, status, type, limit, offset) {
        const [complaints, total] = await this.complaintsService.getUserComplaints(req.user.id, {
            status,
            type,
            limit: limit ? parseInt(limit) : 10,
            offset: offset ? parseInt(offset) : 0,
        });
        return { complaints, total };
    }
    /**
     * Obtener reclamos de una tienda (tienda)
     */
    async getShopComplaints(shopId, status, limit, offset) {
        const [complaints, total] = await this.complaintsService.getShopComplaints(shopId, {
            status,
            limit: limit ? parseInt(limit) : 10,
            offset: offset ? parseInt(offset) : 0,
        });
        return { complaints, total };
    }
    /**
     * Obtener todos los reclamos (admin)
     */
    async getAllComplaints(status, type, shopId, raffleId, startDate, endDate, limit, offset) {
        const [complaints, total] = await this.complaintsService.getAllComplaints({
            status,
            type,
            shopId,
            raffleId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit) : 20,
            offset: offset ? parseInt(offset) : 0,
        });
        return { complaints, total };
    }
    /**
     * Actualizar reclamo (admin)
     */
    async updateComplaint(id, req, dto) {
        return this.complaintsService.updateComplaint(id, req.user.id, dto);
    }
    /**
     * Agregar mensaje al reclamo
     */
    async addMessage(id, req, dto) {
        const senderType = req.user.role === 'admin' ? complaint_message_entity_1.MessageSender.ADMIN : complaint_message_entity_1.MessageSender.USER;
        return this.complaintsService.addMessage(id, req.user.id, senderType, dto);
    }
    /**
     * Obtener mensajes del reclamo
     */
    async getMessages(id) {
        return this.complaintsService.getMessages(id);
    }
    /**
     * Agregar adjunto al reclamo
     */
    async addAttachment(id, req, body) {
        return this.complaintsService.addAttachment(id, req.user.id, body.fileName, body.fileUrl, body.fileType, body.fileSize, body.description);
    }
    /**
     * Obtener adjuntos del reclamo
     */
    async getAttachments(id) {
        return this.complaintsService.getAttachments(id);
    }
    /**
     * Cancelar reclamo (usuario)
     */
    async cancelComplaint(id, req) {
        return this.complaintsService.cancelComplaint(id, req.user.id);
    }
    /**
     * Exportar libro de reclamaciones (CSV)
     */
    async exportComplaints(startDate, endDate, shopId, status) {
        const csv = await this.complaintsService.exportComplaints({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            shopId,
            status,
        });
        return {
            data: csv,
            filename: `libro-reclamaciones-${new Date().toISOString().split('T')[0]}.csv`,
        };
    }
    /**
     * Obtener estadísticas de reclamos
     */
    async getStats() {
        return this.complaintsService.getComplaintStats();
    }
};
exports.ComplaintsController = ComplaintsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_complaint_dto_1.CreateComplaintDto]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "createComplaint", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "getComplaint", null);
__decorate([
    (0, common_1.Get)('user/my-complaints'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "getUserComplaints", null);
__decorate([
    (0, common_1.Get)('shop/:shopId'),
    __param(0, (0, common_1.Param)('shopId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "getShopComplaints", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('shopId')),
    __param(3, (0, common_1.Query)('raffleId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "getAllComplaints", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_complaint_dto_1.UpdateComplaintDto]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "updateComplaint", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, add_message_dto_1.AddMessageDto]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Get)(':id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "getAttachments", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "cancelComplaint", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('shopId')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "exportComplaints", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplaintsController.prototype, "getStats", null);
exports.ComplaintsController = ComplaintsController = __decorate([
    (0, common_1.Controller)('api/complaints'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [complaints_service_1.ComplaintsService])
], ComplaintsController);
