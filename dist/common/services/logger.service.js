"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let LoggerService = class LoggerService {
    constructor() {
        this.logger = new common_1.Logger('AppLogger');
        this.logDir = 'logs';
        this.maxLogSize = 10 * 1024 * 1024; // 10MB
        this.ensureLogDirectory();
    }
    /**
     * Registrar información
     */
    info(message, context, data) {
        const sanitizedData = this.sanitizeData(data);
        this.log('INFO', message, context, sanitizedData);
    }
    /**
     * Registrar advertencia
     */
    warn(message, context, data) {
        const sanitizedData = this.sanitizeData(data);
        this.log('WARN', message, context, sanitizedData);
    }
    /**
     * Registrar error
     */
    error(message, context, data) {
        const sanitizedData = this.sanitizeData(data);
        this.log('ERROR', message, context, sanitizedData);
    }
    /**
     * Registrar debug
     */
    debug(message, context, data) {
        const sanitizedData = this.sanitizeData(data);
        this.log('DEBUG', message, context, sanitizedData);
    }
    /**
     * Registrar acción de usuario
     */
    logUserAction(userId, action, details) {
        const sanitizedDetails = this.sanitizeData(details);
        const entry = {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message: `User action: ${action}`,
            userId,
            action,
            data: sanitizedDetails,
        };
        this.writeToFile(entry);
    }
    /**
     * Registrar acceso a API
     */
    logApiAccess(method, path, statusCode, userId) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message: `API Access: ${method} ${path} - ${statusCode}`,
            userId,
            data: { method, path, statusCode },
        };
        this.writeToFile(entry);
    }
    /**
     * Registrar error de seguridad
     */
    logSecurityEvent(event, details) {
        const sanitizedDetails = this.sanitizeData(details);
        const entry = {
            timestamp: new Date().toISOString(),
            level: 'WARN',
            message: `Security Event: ${event}`,
            data: sanitizedDetails,
        };
        this.writeToFile(entry);
    }
    /**
     * Sanitizar datos para no guardar información sensible
     */
    sanitizeData(data) {
        if (!data)
            return undefined;
        if (typeof data !== 'object')
            return data;
        const sanitized = { ...data };
        const sensitiveFields = [
            'password',
            'token',
            'accessToken',
            'refreshToken',
            'creditCard',
            'cardNumber',
            'cvv',
            'ssn',
            'apiKey',
            'secret',
        ];
        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        }
        return sanitized;
    }
    /**
     * Escribir en archivo de log
     */
    writeToFile(entry) {
        try {
            const logFile = path.join(this.logDir, `app-${this.getDateString()}.log`);
            // Verificar tamaño del archivo
            if (fs.existsSync(logFile)) {
                const stats = fs.statSync(logFile);
                if (stats.size > this.maxLogSize) {
                    this.rotateLogFile(logFile);
                }
            }
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(logFile, logLine);
        }
        catch (error) {
            this.logger.error('Failed to write to log file', error);
        }
    }
    /**
     * Rotar archivo de log
     */
    rotateLogFile(logFile) {
        const timestamp = Date.now();
        const rotatedFile = logFile.replace('.log', `.${timestamp}.log`);
        fs.renameSync(logFile, rotatedFile);
    }
    /**
     * Obtener fecha en formato YYYY-MM-DD
     */
    getDateString() {
        const date = new Date();
        return date.toISOString().split('T')[0];
    }
    /**
     * Asegurar que el directorio de logs existe
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    /**
     * Método privado para registrar
     */
    log(level, message, context, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            data,
        };
        // Mostrar en consola
        const logMessage = `[${entry.timestamp}] [${level}] ${message}`;
        switch (level) {
            case 'INFO':
                this.logger.log(logMessage);
                break;
            case 'WARN':
                this.logger.warn(logMessage);
                break;
            case 'ERROR':
                this.logger.error(logMessage);
                break;
            case 'DEBUG':
                this.logger.debug(logMessage);
                break;
        }
        // Escribir en archivo
        this.writeToFile(entry);
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoggerService);
