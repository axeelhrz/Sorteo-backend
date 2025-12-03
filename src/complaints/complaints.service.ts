import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint, ComplaintStatus, ComplaintType, ComplaintResolution } from './complaint.entity';
import { ComplaintMessage, MessageSender } from './complaint-message.entity';
import { ComplaintAttachment } from './complaint-attachment.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    @InjectRepository(ComplaintMessage)
    private messageRepository: Repository<ComplaintMessage>,
    @InjectRepository(ComplaintAttachment)
    private attachmentRepository: Repository<ComplaintAttachment>,
    private auditService: AuditService,
  ) {}

  /**
   * Generar número de reclamo único consecutivo
   */
  private async generateComplaintNumber(): Promise<string> {
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
  async createComplaint(userId: string, dto: CreateComplaintDto): Promise<Complaint> {
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
      status: ComplaintStatus.PENDING,
      maxResponseDate,
    });

    const saved = await this.complaintRepository.save(complaint);

    // Registrar en auditoría
    await this.auditService.log(
      userId,
      'complaint_created' as any,
      'complaint',
      saved.id,
      {
        details: {
          complaintNumber: saved.complaintNumber,
          type: saved.type,
          raffleId: saved.raffleId,
          shopId: saved.shopId,
        },
      },
    );

    return saved;
  }

  /**
   * Obtener reclamo por ID
   */
  async getComplaintById(id: string): Promise<Complaint> {
    const complaint = await this.complaintRepository.findOne({
      where: { id },
      relations: ['user', 'shop', 'raffle', 'payment', 'assignedAdmin', 'messages', 'messages.sender', 'attachments', 'attachments.uploader'],
    });

    if (!complaint) {
      throw new NotFoundException('Reclamo no encontrado');
    }

    return complaint;
  }

  /**
   * Obtener reclamos del usuario
   */
  async getUserComplaints(userId: string, options?: {
    status?: ComplaintStatus;
    type?: ComplaintType;
    limit?: number;
    offset?: number;
  }): Promise<[Complaint[], number]> {
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
  async getShopComplaints(shopId: string, options?: {
    status?: ComplaintStatus;
    limit?: number;
    offset?: number;
  }): Promise<[Complaint[], number]> {
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
  async getAllComplaints(options?: {
    status?: ComplaintStatus;
    type?: ComplaintType;
    shopId?: string;
    raffleId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<[Complaint[], number]> {
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
  async updateComplaint(id: string, adminId: string, dto: UpdateComplaintDto): Promise<Complaint> {
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
    await this.auditService.log(
      adminId,
      'complaint_updated' as any,
      'complaint',
      id,
      {
        previousStatus: oldStatus,
        newStatus: complaint.status,
        details: {
          resolution: complaint.resolution,
          resolutionNotes: complaint.resolutionNotes,
        },
      },
    );

    return updated;
  }

  /**
   * Agregar mensaje al reclamo
   */
  async addMessage(complaintId: string, senderId: string, senderType: MessageSender, dto: AddMessageDto): Promise<ComplaintMessage> {
    const complaint = await this.getComplaintById(complaintId);

    // Cambiar estado a IN_REVIEW si está en PENDING
    if (complaint.status === ComplaintStatus.PENDING) {
      complaint.status = ComplaintStatus.IN_REVIEW;
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
  async getMessages(complaintId: string): Promise<ComplaintMessage[]> {
    return this.messageRepository.find({
      where: { complaintId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Agregar adjunto al reclamo
   */
  async addAttachment(
    complaintId: string,
    uploadedBy: string,
    fileName: string,
    fileUrl: string,
    fileType: string,
    fileSize: number,
    description?: string,
  ): Promise<ComplaintAttachment> {
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
  async getAttachments(complaintId: string): Promise<ComplaintAttachment[]> {
    return this.attachmentRepository.find({
      where: { complaintId },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Cancelar reclamo (usuario)
   */
  async cancelComplaint(id: string, userId: string): Promise<Complaint> {
    const complaint = await this.getComplaintById(id);

    if (complaint.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para cancelar este reclamo');
    }

    if (complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.REJECTED) {
      throw new BadRequestException('No puedes cancelar un reclamo ya resuelto');
    }

    complaint.status = ComplaintStatus.CANCELLED;
    complaint.resolution = ComplaintResolution.CANCELLED;

    return this.complaintRepository.save(complaint);
  }

  /**
   * Exportar libro de reclamaciones (CSV)
   */
  async exportComplaints(options?: {
    startDate?: Date;
    endDate?: Date;
    shopId?: string;
    status?: ComplaintStatus;
  }): Promise<string> {
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
  async getComplaintStats(): Promise<any> {
    const total = await this.complaintRepository.count();
    const pending = await this.complaintRepository.count({ where: { status: ComplaintStatus.PENDING } });
    const inReview = await this.complaintRepository.count({ where: { status: ComplaintStatus.IN_REVIEW } });
    const resolved = await this.complaintRepository.count({ where: { status: ComplaintStatus.RESOLVED } });
    const rejected = await this.complaintRepository.count({ where: { status: ComplaintStatus.REJECTED } });

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
}