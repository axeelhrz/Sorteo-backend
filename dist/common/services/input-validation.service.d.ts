export declare class InputValidationService {
    /**
     * Sanitizar string para prevenir XSS
     */
    sanitizeString(input: string): string;
    /**
     * Validar email
     */
    validateEmail(email: string): boolean;
    /**
     * Validar URL
     */
    validateUrl(url: string): boolean;
    /**
     * Validar número positivo
     */
    validatePositiveNumber(value: any): boolean;
    /**
     * Validar UUID
     */
    validateUUID(uuid: string): boolean;
    /**
     * Validar tamaño de archivo
     */
    validateFileSize(fileSizeInBytes: number, maxSizeInMB?: number): boolean;
    /**
     * Validar tipo de archivo
     */
    validateFileType(mimeType: string, allowedTypes: string[]): boolean;
    /**
     * Sanitizar objeto
     */
    sanitizeObject(obj: any): any;
    /**
     * Validar contraseña fuerte
     */
    validateStrongPassword(password: string): {
        valid: boolean;
        errors: string[];
    };
}
