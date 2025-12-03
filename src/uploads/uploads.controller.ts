import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UploadsService } from './uploads.service';
import { memoryStorage } from 'multer';

@Controller('api/uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  /**
   * Subir imagen de producto
   */
  @Post('products/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Tipo de archivo no permitido. Solo se permiten imágenes: ${allowedMimeTypes.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const fileUrl = await this.uploadsService.saveFile(file);

    return {
      success: true,
      fileUrl,
      message: 'Imagen subida exitosamente',
    };
  }

  /**
   * Eliminar imagen
   */
  @Delete('products/image/:fileName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async deleteImage(@Param('fileName') fileName: string) {
    const fileUrl = `/uploads/products/${fileName}`;
    await this.uploadsService.deleteFile(fileUrl);

    return {
      success: true,
      message: 'Imagen eliminada exitosamente',
    };
  }
}

