import { IsString, IsEmail, IsOptional, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateShopDto {
  @IsUUID()
  userId: string;

  @IsString()
  @Length(3, 255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @IsOptional()
  @IsEmail()
  publicEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  socialMedia?: string;
}