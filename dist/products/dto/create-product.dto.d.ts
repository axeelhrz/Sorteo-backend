export declare class CreateProductDto {
    shopId: string;
    name: string;
    description: string;
    value: number;
    height: number;
    width: number;
    depth: number;
    category?: string;
    mainImage?: string;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    value?: number;
    height?: number;
    width?: number;
    depth?: number;
    category?: string;
    mainImage?: string;
}
export declare class ProductResponseDto {
    id: string;
    shopId: string;
    name: string;
    description: string;
    value: number;
    height: number;
    width: number;
    depth: number;
    requiresDeposit: boolean;
    category?: string;
    mainImage?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProductWithDepositInfoDto extends ProductResponseDto {
    depositRequired: boolean;
    depositAmount: number;
    depositReason: string;
}
