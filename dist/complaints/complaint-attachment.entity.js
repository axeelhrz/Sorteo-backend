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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintAttachment = void 0;
const typeorm_1 = require("typeorm");
const complaint_entity_1 = require("./complaint.entity");
const user_entity_1 = require("../users/user.entity");
let ComplaintAttachment = class ComplaintAttachment {
};
exports.ComplaintAttachment = ComplaintAttachment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ComplaintAttachment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ComplaintAttachment.prototype, "complaintId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => complaint_entity_1.Complaint, (complaint) => complaint.attachments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'complaintId' }),
    __metadata("design:type", complaint_entity_1.Complaint)
], ComplaintAttachment.prototype, "complaint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ComplaintAttachment.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'uploadedBy' }),
    __metadata("design:type", user_entity_1.User)
], ComplaintAttachment.prototype, "uploader", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ComplaintAttachment.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], ComplaintAttachment.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], ComplaintAttachment.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], ComplaintAttachment.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ComplaintAttachment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ComplaintAttachment.prototype, "createdAt", void 0);
exports.ComplaintAttachment = ComplaintAttachment = __decorate([
    (0, typeorm_1.Entity)('complaint_attachments'),
    (0, typeorm_1.Index)(['complaintId']),
    (0, typeorm_1.Index)(['uploadedBy'])
], ComplaintAttachment);
