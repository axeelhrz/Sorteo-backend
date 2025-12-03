import { Shop } from '../shops/shop.entity';
import { Raffle } from '../raffles/raffle.entity';
export declare const ProductStatus: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly ARCHIVED: "archived";
};
export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];
export declare class Product {
    id: string;
    shopId: string;
    shop: Shop;
    name: string;
    description: string;
    value: number;
    height: number;
    width: number;
    depth: number;
    requiresDeposit: boolean;
    category: string;
    mainImage: string;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    raffles: Raffle[];
}
