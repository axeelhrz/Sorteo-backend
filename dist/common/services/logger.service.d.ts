export declare class LoggerService {
    private readonly logger;
    private readonly logDir;
    private readonly maxLogSize;
    constructor();
    /**
     * Registrar información
     */
    info(message: string, context?: string, data?: any): void;
    /**
     * Registrar advertencia
     */
    warn(message: string, context?: string, data?: any): void;
    /**
     * Registrar error
     */
    error(message: string, context?: string, data?: any): void;
    /**
     * Registrar debug
     */
    debug(message: string, context?: string, data?: any): void;
    /**
     * Registrar acción de usuario
     */
    logUserAction(userId: string, action: string, details?: any): void;
    /**
     * Registrar acceso a API
     */
    logApiAccess(method: string, path: string, statusCode: number, userId?: string): void;
    /**
     * Registrar error de seguridad
     */
    logSecurityEvent(event: string, details?: any): void;
    /**
     * Sanitizar datos para no guardar información sensible
     */
    private sanitizeData;
    /**
     * Escribir en archivo de log
     */
    private writeToFile;
    /**
     * Rotar archivo de log
     */
    private rotateLogFile;
    /**
     * Obtener fecha en formato YYYY-MM-DD
     */
    private getDateString;
    /**
     * Asegurar que el directorio de logs existe
     */
    private ensureLogDirectory;
    /**
     * Método privado para registrar
     */
    private log;
}
