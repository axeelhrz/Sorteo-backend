export class CreateDepositDto {
  shopId: string;
  raffleId: string;
  amount: number;
  notes?: string;
}

export class UpdateDepositStatusDto {
  status: 'pending' | 'held' | 'released' | 'executed';
  notes?: string;
}

export class DepositResponseDto {
  id: string;
  shopId: string;
  raffleId: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}