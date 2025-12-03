import { UserRole } from '../../users/user.entity';
export declare class AuthResponseDto {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    token: string;
}
