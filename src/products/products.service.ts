import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Shop } from '../shops/shop.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Validar que la tienda existe
    const shop = await this.shopsRepository.findOne({
      where: { id: createProductDto.shopId },
    });

    if (!shop) {
      throw new BadRequestException('Tienda no encontrada');
    }

    // Calcular si requiere depósito (si alguna dimensión > 15 cm)
    const requiresDeposit =
      createProductDto.height > 15 ||
      createProductDto.width > 15 ||
      createProductDto.depth > 15;

    // Crear el producto
    const product = this.productsRepository.create({
      ...createProductDto,
      requiresDeposit,
      status: ProductStatus.ACTIVE,
    });

    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['shop', 'raffles'],
    });
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['shop', 'raffles'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async findByShopId(shopId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { shopId },
      relations: ['raffles'],
    });
  }

  async findActiveByShopId(shopId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { shopId, status: ProductStatus.ACTIVE },
      relations: ['raffles'],
    });
  }

  async findActive(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { status: ProductStatus.ACTIVE },
      relations: ['shop', 'raffles'],
    });
  }

  async update(id: string, updateData: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.findById(id);

    // Si se actualizan dimensiones, recalcular requiresDeposit
    if (updateData.height || updateData.width || updateData.depth) {
      const height = updateData.height || product.height;
      const width = updateData.width || product.width;
      const depth = updateData.depth || product.depth;

      product.requiresDeposit = height > 15 || width > 15 || depth > 15;
    }

    Object.assign(product, updateData);
    return this.productsRepository.save(product);
  }

  async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    const product = await this.findById(id);
    product.status = status;
    return this.productsRepository.save(product);
  }

  async deactivate(id: string): Promise<Product> {
    return this.updateStatus(id, ProductStatus.INACTIVE);
  }

  async archive(id: string): Promise<Product> {
    return this.updateStatus(id, ProductStatus.ARCHIVED);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);

    // Validar que no tenga sorteos activos
    const activeRaffles = product.raffles?.filter((r) => r.status === 'active');
    if (activeRaffles && activeRaffles.length > 0) {
      throw new BadRequestException('No se puede eliminar un producto con sorteos activos');
    }

    await this.productsRepository.remove(product);
  }
}