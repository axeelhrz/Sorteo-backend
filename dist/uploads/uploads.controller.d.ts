import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private uploadsService;
    constructor(uploadsService: UploadsService);
    /**
     * Subir imagen de producto
     */
    uploadProductImage(file: Express.Multer.File): Promise<{
        success: boolean;
        fileUrl: string;
        message: string;
    }>;
    /**
     * Eliminar imagen
     */
    deleteImage(fileName: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
