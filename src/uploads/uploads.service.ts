import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'products');

  constructor() {
    // Crear directorio de uploads si no existe
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
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
  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      // Validar tipo de archivo
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Tipo de archivo no permitido. Solo se permiten imágenes: ${allowedMimeTypes.join(', ')}`,
        );
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException('El archivo es demasiado grande. Máximo permitido: 5MB');
      }

      // Generar nombre único
      const fileExtension = path.extname(file.originalname);
      const fileName = `${randomUUID()}${fileExtension}`;
      const filePath = path.join(this.uploadsDir, fileName);

      // Guardar archivo
      fs.writeFileSync(filePath, file.buffer);

      // Retornar URL relativa
      const fileUrl = `/uploads/products/${fileName}`;
      this.logger.log(`Archivo guardado: ${fileUrl}`);

      return fileUrl;
    } catch (error) {
      this.logger.error('Error guardando archivo:', error);
      throw error;
    }
  }

  /**
   * Elimina un archivo del sistema
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extraer nombre del archivo de la URL
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadsDir, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Archivo eliminado: ${fileUrl}`);
      }
    } catch (error) {
      this.logger.error('Error eliminando archivo:', error);
      // No lanzar error para no interrumpir el flujo
    }
  }

  /**
   * Obtiene la ruta completa del archivo
   */
  getFilePath(fileUrl: string): string {
    const fileName = path.basename(fileUrl);
    return path.join(this.uploadsDir, fileName);
  }
}

