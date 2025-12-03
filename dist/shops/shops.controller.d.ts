import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { Shop } from './shop.entity';
export declare class ShopsController {
    private readonly shopsService;
    constructor(shopsService: ShopsService);
    create(createShopDto: CreateShopDto): Promise<Shop>;
    findAll(): Promise<Shop[]>;
    findVerified(): Promise<Shop[]>;
    getMyShop(req: any): Promise<Shop>;
    findByUserId(userId: string): Promise<Shop[]>;
    getStatistics(id: string, req: any): Promise<any>;
    findById(id: string): Promise<Shop>;
    update(id: string, updateData: Partial<CreateShopDto>): Promise<Shop>;
    verify(id: string): Promise<Shop>;
    block(id: string): Promise<Shop>;
    delete(id: string): Promise<void>;
}
