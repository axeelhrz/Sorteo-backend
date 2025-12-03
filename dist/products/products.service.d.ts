import { Repository } from 'typeorm';
import { Product, ProductStatus } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Shop } from '../shops/shop.entity';
export declare class ProductsService {
    private productsRepository;
    private shopsRepository;
    constructor(productsRepository: Repository<Product>, shopsRepository: Repository<Shop>);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(): Promise<Product[]>;
    findById(id: string): Promise<Product>;
    findByShopId(shopId: string): Promise<Product[]>;
    findActiveByShopId(shopId: string): Promise<Product[]>;
    findActive(): Promise<Product[]>;
    update(id: string, updateData: Partial<CreateProductDto>): Promise<Product>;
    updateStatus(id: string, status: ProductStatus): Promise<Product>;
    deactivate(id: string): Promise<Product>;
    archive(id: string): Promise<Product>;
    delete(id: string): Promise<void>;
}
