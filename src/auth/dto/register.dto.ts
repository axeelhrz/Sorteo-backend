import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../users/user.entity';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn([UserRole.USER, UserRole.SHOP])
  role: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @MinLength(3)
  shopName?: string;
}