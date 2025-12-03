import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context?: string;
  data?: any;
  userId?: string;
  action?: string;
}

@Injectable()
export class LoggerService {
  private readonly logger = new Logger('AppLogger');
  private readonly logDir = 'logs';
  private readonly maxLogSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.ensureLogDirectory();
  }

  /**
   * Registrar información
   */
  info(message: string, context?: string, data?: any): void {
    const sanitizedData = this.sanitizeData(data);
    this.log('INFO', message, context, sanitizedData);
  }

  /**
   * Registrar advertencia
   */
  warn(message: string, context?: string, data?: any): void {
    const sanitizedData = this.sanitizeData(data);
    this.log('WARN', message, context, sanitizedData);
  }

  /**
   * Registrar error
   */
  error(message: string, context?: string, data?: any): void {
    const sanitizedData = this.sanitizeData(data);
    this.log('ERROR', message, context, sanitizedData);
  }

  /**
   * Registrar debug
   */
  debug(message: string, context?: string, data?: any): void {
    const sanitizedData = this.sanitizeData(data);
    this.log('DEBUG', message, context, sanitizedData);
  }

  /**
   * Registrar acción de usuario
   */
  logUserAction(userId: string, action: string, details?: any): void {
    const sanitizedDetails = this.sanitizeData(details);
    const entry: LogEntry = {
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
  logApiAccess(method: string, path: string, statusCode: number, userId?: string): void {
    const entry: LogEntry = {
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
  logSecurityEvent(event: string, details?: any): void {
    const sanitizedDetails = this.sanitizeData(details);
    const entry: LogEntry = {
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
  private sanitizeData(data: any): any {
    if (!data) return undefined;

    if (typeof data !== 'object') return data;

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
  private writeToFile(entry: LogEntry): void {
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
    } catch (error) {
      this.logger.error('Failed to write to log file', error);
    }
  }

  /**
   * Rotar archivo de log
   */
  private rotateLogFile(logFile: string): void {
    const timestamp = Date.now();
    const rotatedFile = logFile.replace('.log', `.${timestamp}.log`);
    fs.renameSync(logFile, rotatedFile);
  }

  /**
   * Obtener fecha en formato YYYY-MM-DD
   */
  private getDateString(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  /**
   * Asegurar que el directorio de logs existe
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Método privado para registrar
   */
  private log(
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
    message: string,
    context?: string,
    data?: any,
  ): void {
    const entry: LogEntry = {
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
}