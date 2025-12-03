import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Raffle } from '../raffles/raffle.entity';
import { Deposit } from '../deposits/deposit.entity';
export declare const ShopStatus: {
    readonly PENDING: "pending";
    readonly VERIFIED: "verified";
    readonly BLOCKED: "blocked";
};
export type ShopStatus = typeof ShopStatus[keyof typeof ShopStatus];
export declare class Shop {
    id: string;
    userId: string;
    user: User;
    name: string;
    description: string;
    logo: string;
    publicEmail: string;
    phone: string;
    socialMedia: string;
    status: ShopStatus;
    createdAt: Date;
    updatedAt: Date;
    products: Product[];
    raffles: Raffle[];
    deposits: Deposit[];
}
