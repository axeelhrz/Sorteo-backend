"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputValidationService = void 0;
const common_1 = require("@nestjs/common");
let InputValidationService = class InputValidationService {
    /**
     * Sanitizar string para prevenir XSS
     */
    sanitizeString(input) {
        if (!input)
            return '';
        return input
            .replace(/[<>]/g, '') // Remover < y >
            .replace(/javascript:/gi, '') // Remover javascript:
            .replace(/on\w+\s*=/gi, '') // Remover event handlers
            .trim();
    }
    /**
     * Validar email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Validar URL
     */
    validateUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validar número positivo
     */
    validatePositiveNumber(value) {
        const num = Number(value);
        return !isNaN(num) && num > 0;
    }
    /**
     * Validar UUID
     */
    validateUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    /**
     * Validar tamaño de archivo
     */
    validateFileSize(fileSizeInBytes, maxSizeInMB = 5) {
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        return fileSizeInBytes <= maxSizeInBytes;
    }
    /**
     * Validar tipo de archivo
     */
    validateFileType(mimeType, allowedTypes) {
        return allowedTypes.includes(mimeType);
    }
    /**
     * Sanitizar objeto
     */
    sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }
        const sanitized = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (typeof value === 'string') {
                    sanitized[key] = this.sanitizeString(value);
                }
                else if (typeof value === 'object') {
                    sanitized[key] = this.sanitizeObject(value);
                }
                else {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    }
    /**
     * Validar contraseña fuerte
     */
    validateStrongPassword(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*)');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
};
exports.InputValidationService = InputValidationService;
exports.InputValidationService = InputValidationService = __decorate([
    (0, common_1.Injectable)()
], InputValidationService);
