"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/user.entity");
const shop_entity_1 = require("../shops/shop.entity");
let AuthService = class AuthService {
    constructor(usersRepository, shopsRepository, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.shopsRepository = shopsRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.accessTokenExpiry = '15m';
        this.refreshTokenExpiry = '7d';
    }
    async register(registerDto) {
        const { name, email, password, role, shopName } = registerDto;
        // Validar que el rol no sea admin
        if (role === user_entity_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Cannot assign admin role');
        }
        // Si el rol es shop, validar que se proporcione el nombre de la tienda
        if (role === user_entity_1.UserRole.SHOP && !shopName) {
            throw new common_1.BadRequestException('El nombre de la tienda es requerido para usuarios con rol tienda');
        }
        // Verificar si el email ya existe
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already exists');
        }
        // Validar contraseña fuerte (mínimo 8 caracteres, mayúscula, minúscula, número)
        if (!this.isStrongPassword(password)) {
            throw new common_1.BadRequestException('Password must be at least 8 characters with uppercase, lowercase, and numbers');
        }
        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        // Crear usuario
        const user = this.usersRepository.create({
            name,
            email,
            password: hashedPassword,
            role: (role || user_entity_1.UserRole.USER),
        });
        await this.usersRepository.save(user);
        // Si el rol es shop y se proporcionó el nombre de la tienda, crear la tienda automáticamente
        if (role === user_entity_1.UserRole.SHOP && shopName) {
            try {
                // Verificar si ya existe una tienda para este usuario
                const existingShop = await this.shopsRepository.findOne({
                    where: { userId: user.id },
                });
                if (!existingShop) {
                    const shop = this.shopsRepository.create({
                        userId: user.id,
                        name: shopName.trim(),
                        status: shop_entity_1.ShopStatus.PENDING,
                    });
                    const savedShop = await this.shopsRepository.save(shop);
                    console.log(`✅ Tienda creada automáticamente para usuario ${user.id}: ${savedShop.id} - ${savedShop.name}`);
                }
                else {
                    console.log(`ℹ️  Usuario ${user.id} ya tiene una tienda: ${existingShop.id}`);
                }
            }
            catch (error) {
                console.error('❌ Error al crear la tienda durante el registro:', error);
                // Lanzar error para que el usuario sepa que hubo un problema
                throw new common_1.BadRequestException('Error al crear la tienda. Por favor, intenta nuevamente o contacta con soporte.');
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
    async login(loginDto) {
        const { email, password } = loginDto;
        // Buscar usuario
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
    async getProfile(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
    async refreshToken(refreshTokenDto) {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret-key',
            });
            const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const accessToken = this.jwtService.sign({
                sub: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }, { expiresIn: this.accessTokenExpiry });
            return { accessToken };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    generateTokens(user) {
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
            secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret-key',
            expiresIn: this.refreshTokenExpiry,
        });
        return { accessToken, refreshToken };
    }
    isStrongPassword(password) {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongPasswordRegex.test(password);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
