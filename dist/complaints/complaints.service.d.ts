import { Repository } from 'typeorm';
import { Complaint, ComplaintStatus, ComplaintType } from './complaint.entity';
import { ComplaintMessage, MessageSender } from './complaint-message.entity';
import { ComplaintAttachment } from './complaint-attachment.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { AuditService } from '../audit/audit.service';
export declare class ComplaintsService {
    private complaintRepository;
    private messageRepository;
    private attachmentRepository;
    private auditService;
    constructor(complaintRepository: Repository<Complaint>, messageRepository: Repository<ComplaintMessage>, attachmentRepository: Repository<ComplaintAttachment>, auditService: AuditService);
    /**
     * Generar número de reclamo único consecutivo
     */
    private generateComplaintNumber;
    /**
     * Crear un nuevo reclamo
     */
    createComplaint(userId: string, dto: CreateComplaintDto): Promise<Complaint>;
    /**
     * Obtener reclamo por ID
     */
    getComplaintById(id: string): Promise<Complaint>;
    /**
     * Obtener reclamos del usuario
     */
    getUserComplaints(userId: string, options?: {
        status?: ComplaintStatus;
        type?: ComplaintType;
        limit?: number;
        offset?: number;
    }): Promise<[Complaint[], number]>;
    /**
     * Obtener reclamos de una tienda
     */
    getShopComplaints(shopId: string, options?: {
        status?: ComplaintStatus;
        limit?: number;
        offset?: number;
    }): Promise<[Complaint[], number]>;
    /**
     * Obtener todos los reclamos (admin)
     */
    getAllComplaints(options?: {
        status?: ComplaintStatus;
        type?: ComplaintType;
        shopId?: string;
        raffleId?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<[Complaint[], number]>;
    /**
     * Actualizar reclamo (admin)
     */
    updateComplaint(id: string, adminId: string, dto: UpdateComplaintDto): Promise<Complaint>;
    /**
     * Agregar mensaje al reclamo
     */
    addMessage(complaintId: string, senderId: string, senderType: MessageSender, dto: AddMessageDto): Promise<ComplaintMessage>;
    /**
     * Obtener mensajes del reclamo
     */
    getMessages(complaintId: string): Promise<ComplaintMessage[]>;
    /**
     * Agregar adjunto al reclamo
     */
    addAttachment(complaintId: string, uploadedBy: string, fileName: string, fileUrl: string, fileType: string, fileSize: number, description?: string): Promise<ComplaintAttachment>;
    /**
     * Obtener adjuntos del reclamo
     */
    getAttachments(complaintId: string): Promise<ComplaintAttachment[]>;
    /**
     * Cancelar reclamo (usuario)
     */
    cancelComplaint(id: string, userId: string): Promise<Complaint>;
    /**
     * Exportar libro de reclamaciones (CSV)
     */
    exportComplaints(options?: {
        startDate?: Date;
        endDate?: Date;
        shopId?: string;
        status?: ComplaintStatus;
    }): Promise<string>;
    /**
     * Obtener estadísticas de reclamos
     */
    getComplaintStats(): Promise<any>;
}
