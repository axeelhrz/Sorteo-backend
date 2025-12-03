import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query('shopId') shopId?: string,
  ): Promise<Product[]> {
    if (shopId) {
      return this.productsService.findByShopId(shopId);
    }
    return this.productsService.findAll();
  }

  @Get('shop/:shopId/active')
  async findActiveByShop(@Param('shopId') shopId: string): Promise<Product[]> {
    return this.productsService.findActiveByShopId(shopId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.delete(id);
  }

  @Put(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shop', 'admin')
  async archive(@Param('id') id: string): Promise<Product> {
    return this.productsService.archive(id);
  }
}