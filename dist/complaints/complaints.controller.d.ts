import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { ComplaintStatus, ComplaintType } from './complaint.entity';
export declare class ComplaintsController {
    private complaintsService;
    constructor(complaintsService: ComplaintsService);
    /**
     * Crear un nuevo reclamo (usuario)
     */
    createComplaint(req: any, dto: CreateComplaintDto): Promise<import("./complaint.entity").Complaint>;
    /**
     * Obtener reclamo por ID
     */
    getComplaint(id: string): Promise<import("./complaint.entity").Complaint>;
    /**
     * Obtener reclamos del usuario autenticado
     */
    getUserComplaints(req: any, status?: ComplaintStatus, type?: ComplaintType, limit?: string, offset?: string): Promise<{
        complaints: import("./complaint.entity").Complaint[];
        total: number;
    }>;
    /**
     * Obtener reclamos de una tienda (tienda)
     */
    getShopComplaints(shopId: string, status?: ComplaintStatus, limit?: string, offset?: string): Promise<{
        complaints: import("./complaint.entity").Complaint[];
        total: number;
    }>;
    /**
     * Obtener todos los reclamos (admin)
     */
    getAllComplaints(status?: ComplaintStatus, type?: ComplaintType, shopId?: string, raffleId?: string, startDate?: string, endDate?: string, limit?: string, offset?: string): Promise<{
        complaints: import("./complaint.entity").Complaint[];
        total: number;
    }>;
    /**
     * Actualizar reclamo (admin)
     */
    updateComplaint(id: string, req: any, dto: UpdateComplaintDto): Promise<import("./complaint.entity").Complaint>;
    /**
     * Agregar mensaje al reclamo
     */
    addMessage(id: string, req: any, dto: AddMessageDto): Promise<import("./complaint-message.entity").ComplaintMessage>;
    /**
     * Obtener mensajes del reclamo
     */
    getMessages(id: string): Promise<import("./complaint-message.entity").ComplaintMessage[]>;
    /**
     * Agregar adjunto al reclamo
     */
    addAttachment(id: string, req: any, body: {
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        description?: string;
    }): Promise<import("./complaint-attachment.entity").ComplaintAttachment>;
    /**
     * Obtener adjuntos del reclamo
     */
    getAttachments(id: string): Promise<import("./complaint-attachment.entity").ComplaintAttachment[]>;
    /**
     * Cancelar reclamo (usuario)
     */
    cancelComplaint(id: string, req: any): Promise<import("./complaint.entity").Complaint>;
    /**
     * Exportar libro de reclamaciones (CSV)
     */
    exportComplaints(startDate?: string, endDate?: string, shopId?: string, status?: ComplaintStatus): Promise<{
        data: string;
        filename: string;
    }>;
    /**
     * Obtener estadísticas de reclamos
     */
    getStats(): Promise<any>;
}
