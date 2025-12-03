import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(shopId?: string): Promise<Product[]>;
    findActiveByShop(shopId: string): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    update(id: string, updateProductDto: Partial<CreateProductDto>): Promise<Product>;
    remove(id: string): Promise<void>;
    archive(id: string): Promise<Product>;
}
