export declare class UploadsService {
    private readonly logger;
    private readonly uploadsDir;
    constructor();
    private ensureUploadsDirectory;
    /**
     * Guarda un archivo en el sistema de archivos
     */
    saveFile(file: Express.Multer.File): Promise<string>;
    /**
     * Elimina un archivo del sistema
     */
    deleteFile(fileUrl: string): Promise<void>;
    /**
     * Obtiene la ruta completa del archivo
     */
    getFilePath(fileUrl: string): string;
}
