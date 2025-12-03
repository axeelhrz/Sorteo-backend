import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { MessageSender } from './complaint-message.entity';
import { ComplaintStatus, ComplaintType } from './complaint.entity';

@Controller('api/complaints')
@UseGuards(JwtAuthGuard)
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  /**
   * Crear un nuevo reclamo (usuario)
   */
  @Post()
  async createComplaint(@Request() req, @Body() dto: CreateComplaintDto) {
    return this.complaintsService.createComplaint(req.user.id, dto);
  }

  /**
   * Obtener reclamo por ID
   */
  @Get(':id')
  async getComplaint(@Param('id') id: string) {
    return this.complaintsService.getComplaintById(id);
  }

  /**
   * Obtener reclamos del usuario autenticado
   */
  @Get('user/my-complaints')
  async getUserComplaints(
    @Request() req,
    @Query('status') status?: ComplaintStatus,
    @Query('type') type?: ComplaintType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const [complaints, total] = await this.complaintsService.getUserComplaints(req.user.id, {
      status,
      type,
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
    });

    return { complaints, total };
  }

  /**
   * Obtener reclamos de una tienda (tienda)
   */
  @Get('shop/:shopId')
  async getShopComplaints(
    @Param('shopId') shopId: string,
    @Query('status') status?: ComplaintStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const [complaints, total] = await this.complaintsService.getShopComplaints(shopId, {
      status,
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
    });

    return { complaints, total };
  }

  /**
   * Obtener todos los reclamos (admin)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllComplaints(
    @Query('status') status?: ComplaintStatus,
    @Query('type') type?: ComplaintType,
    @Query('shopId') shopId?: string,
    @Query('raffleId') raffleId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const [complaints, total] = await this.complaintsService.getAllComplaints({
      status,
      type,
      shopId,
      raffleId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    });

    return { complaints, total };
  }

  /**
   * Actualizar reclamo (admin)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateComplaint(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateComplaintDto,
  ) {
    return this.complaintsService.updateComplaint(id, req.user.id, dto);
  }

  /**
   * Agregar mensaje al reclamo
   */
  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: AddMessageDto,
  ) {
    const senderType = req.user.role === 'admin' ? MessageSender.ADMIN : MessageSender.USER;
    return this.complaintsService.addMessage(id, req.user.id, senderType, dto);
  }

  /**
   * Obtener mensajes del reclamo
   */
  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return this.complaintsService.getMessages(id);
  }

  /**
   * Agregar adjunto al reclamo
   */
  @Post(':id/attachments')
  async addAttachment(
    @Param('id') id: string,
    @Request() req,
    @Body() body: {
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      description?: string;
    },
  ) {
    return this.complaintsService.addAttachment(
      id,
      req.user.id,
      body.fileName,
      body.fileUrl,
      body.fileType,
      body.fileSize,
      body.description,
    );
  }

  /**
   * Obtener adjuntos del reclamo
   */
  @Get(':id/attachments')
  async getAttachments(@Param('id') id: string) {
    return this.complaintsService.getAttachments(id);
  }

  /**
   * Cancelar reclamo (usuario)
   */
  @Put(':id/cancel')
  async cancelComplaint(@Param('id') id: string, @Request() req) {
    return this.complaintsService.cancelComplaint(id, req.user.id);
  }

  /**
   * Exportar libro de reclamaciones (CSV)
   */
  @Get('export/csv')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async exportComplaints(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('shopId') shopId?: string,
    @Query('status') status?: ComplaintStatus,
  ) {
    const csv = await this.complaintsService.exportComplaints({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      shopId,
      status,
    });

    return {
      data: csv,
      filename: `libro-reclamaciones-${new Date().toISOString().split('T')[0]}.csv`,
    };
  }

  /**
   * Obtener estadísticas de reclamos
   */
  @Get('stats/overview')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getStats() {
    return this.complaintsService.getComplaintStats();
  }
}