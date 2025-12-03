import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { Shop } from './shop.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'shop')
  async create(@Body() createShopDto: CreateShopDto): Promise<Shop> {
    return this.shopsService.create(createShopDto);
  }

  @Get()
  async findAll(): Promise<Shop[]> {
    return this.shopsService.findAll();
  }

  @Get('verified')
  async findVerified(): Promise<Shop[]> {
    return this.shopsService.findVerified();
  }

  @Get('my-shop/current')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop')
  async getMyShop(@Req() req: any): Promise<Shop> {
    try {
      console.log(`🔍 Buscando tienda para usuario: ${req.user.id} (${req.user.name})`);
      const shops = await this.shopsService.findByUserId(req.user.id);
      console.log(`📦 Tiendas encontradas: ${shops?.length || 0}`);
      
      if (!shops || shops.length === 0) {
        // Si no existe una tienda, crearla automáticamente usando el nombre del usuario
        console.log(`⚠️  No se encontró tienda, creando automáticamente...`);
        const shop = await this.shopsService.getOrCreateShopForUser(req.user.id, req.user.name);
        console.log(`✅ Tienda creada/obtenida: ${shop.id} - ${shop.name}`);
        return shop;
      }
      console.log(`✅ Tienda encontrada: ${shops[0].id} - ${shops[0].name}`);
      return shops[0];
    } catch (error) {
      console.error('❌ Error en getMyShop:', error);
      throw error;
    }
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Shop[]> {
    return this.shopsService.findByUserId(userId);
  }

  @Get(':id/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async getStatistics(@Param('id') id: string, @Req() req: any): Promise<any> {
    // Validar que el usuario solo puede ver estadísticas de su propia tienda
    if (req.user.role === 'shop') {
      const shops = await this.shopsService.findByUserId(req.user.id);
      if (!shops.some((s) => s.id === id)) {
        throw new NotFoundException('No tienes permiso para ver estas estadísticas');
      }
    }
    return this.shopsService.getShopStatistics(id);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Shop> {
    return this.shopsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'shop')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateShopDto>,
  ): Promise<Shop> {
    return this.shopsService.update(id, updateData);
  }

  @Put(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async verify(@Param('id') id: string): Promise<Shop> {
    return this.shopsService.verify(id);
  }

  @Put(':id/block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async block(@Param('id') id: string): Promise<Shop> {
    return this.shopsService.block(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string): Promise<void> {
    return this.shopsService.delete(id);
  }
}