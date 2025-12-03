import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../users/user.entity';
import { Shop, ShopStatus } from '../shops/shop.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto & { refreshToken: string }> {
    const { name, email, password, role, shopName } = registerDto;

    // Validar que el rol no sea admin
    if (role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot assign admin role');
    }

    // Si el rol es shop, validar que se proporcione el nombre de la tienda
    if (role === UserRole.SHOP && !shopName) {
      throw new BadRequestException('El nombre de la tienda es requerido para usuarios con rol tienda');
    }

    // Verificar si el email ya existe
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Validar contraseña fuerte (mínimo 8 caracteres, mayúscula, minúscula, número)
    if (!this.isStrongPassword(password)) {
      throw new BadRequestException(
        'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
      role: (role || UserRole.USER) as any,
    });

    await this.usersRepository.save(user);

    // Si el rol es shop y se proporcionó el nombre de la tienda, crear la tienda automáticamente
    if (role === UserRole.SHOP && shopName) {
      try {
        // Verificar si ya existe una tienda para este usuario
        const existingShop = await this.shopsRepository.findOne({
          where: { userId: user.id },
        });

        if (!existingShop) {
          const shop = this.shopsRepository.create({
            userId: user.id,
            name: shopName.trim(),
            status: ShopStatus.PENDING,
          });
          const savedShop = await this.shopsRepository.save(shop);
          console.log(`✅ Tienda creada automáticamente para usuario ${user.id}: ${savedShop.id} - ${savedShop.name}`);
        } else {
          console.log(`ℹ️  Usuario ${user.id} ya tiene una tienda: ${existingShop.id}`);
        }
      } catch (error) {
        console.error('❌ Error al crear la tienda durante el registro:', error);
        // Lanzar error para que el usuario sepa que hubo un problema
        throw new BadRequestException('Error al crear la tienda. Por favor, intenta nuevamente o contacta con soporte.');
      }
    }

    // Generar tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto & { refreshToken: string }> {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generar tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string): Promise<Omit<AuthResponseDto, 'token'>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret-key',
      });

      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        { expiresIn: this.accessTokenExpiry },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret-key',
      expiresIn: this.refreshTokenExpiry,
    });

    return { accessToken, refreshToken };
  }

  private isStrongPassword(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongPasswordRegex.test(password);
  }
}