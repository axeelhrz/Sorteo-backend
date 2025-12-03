export declare class CreateDepositDto {
    shopId: string;
    raffleId: string;
    amount: number;
    notes?: string;
}
export declare class UpdateDepositStatusDto {
    status: 'pending' | 'held' | 'released' | 'executed';
    notes?: string;
}
export declare class DepositResponseDto {
    id: string;
    shopId: string;
    raffleId: string;
    amount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    notes?: string;
}
