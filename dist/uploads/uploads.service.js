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
var UploadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
let UploadsService = UploadsService_1 = class UploadsService {
    constructor() {
        this.logger = new common_1.Logger(UploadsService_1.name);
        this.uploadsDir = path.join(process.cwd(), 'uploads', 'products');
        // Crear directorio de uploads si no existe
        this.ensureUploadsDirectory();
    }
    ensureUploadsDirectory() {
        const uploadsPath = path.join(process.cwd(), 'uploads');
        const productsPath = this.uploadsDir;
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
        }
        if (!fs.existsSync(productsPath)) {
            fs.mkdirSync(productsPath, { recursive: true });
        }
    }
    /**
     * Guarda un archivo en el sistema de archivos
     */
    async saveFile(file) {
        try {
            // Validar tipo de archivo
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException(`Tipo de archivo no permitido. Solo se permiten imágenes: ${allowedMimeTypes.join(', ')}`);
            }
            // Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new common_1.BadRequestException('El archivo es demasiado grande. Máximo permitido: 5MB');
            }
            // Generar nombre único
            const fileExtension = path.extname(file.originalname);
            const fileName = `${(0, crypto_1.randomUUID)()}${fileExtension}`;
            const filePath = path.join(this.uploadsDir, fileName);
            // Guardar archivo
            fs.writeFileSync(filePath, file.buffer);
            // Retornar URL relativa
            const fileUrl = `/uploads/products/${fileName}`;
            this.logger.log(`Archivo guardado: ${fileUrl}`);
            return fileUrl;
        }
        catch (error) {
            this.logger.error('Error guardando archivo:', error);
            throw error;
        }
    }
    /**
     * Elimina un archivo del sistema
     */
    async deleteFile(fileUrl) {
        try {
            // Extraer nombre del archivo de la URL
            const fileName = path.basename(fileUrl);
            const filePath = path.join(this.uploadsDir, fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.log(`Archivo eliminado: ${fileUrl}`);
            }
        }
        catch (error) {
            this.logger.error('Error eliminando archivo:', error);
            // No lanzar error para no interrumpir el flujo
        }
    }
    /**
     * Obtiene la ruta completa del archivo
     */
    getFilePath(fileUrl) {
        const fileName = path.basename(fileUrl);
        return path.join(this.uploadsDir, fileName);
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = UploadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UploadsService);
