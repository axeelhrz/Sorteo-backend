import { UserRole } from '../../users/user.entity';

export class AuthResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}