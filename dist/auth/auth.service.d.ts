import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Shop } from '../shops/shop.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthService {
    private usersRepository;
    private shopsRepository;
    private jwtService;
    private configService;
    private readonly accessTokenExpiry;
    private readonly refreshTokenExpiry;
    constructor(usersRepository: Repository<User>, shopsRepository: Repository<Shop>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto & {
        refreshToken: string;
    }>;
    login(loginDto: LoginDto): Promise<AuthResponseDto & {
        refreshToken: string;
    }>;
    getProfile(userId: string): Promise<Omit<AuthResponseDto, 'token'>>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    private generateTokens;
    private isStrongPassword;
}
