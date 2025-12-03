import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: any): Promise<import("./dto/auth-response.dto").AuthResponseDto & {
        refreshToken: string;
    }>;
    login(loginDto: LoginDto): Promise<import("./dto/auth-response.dto").AuthResponseDto & {
        refreshToken: string;
    }>;
    getProfile(req: any): Promise<Omit<import("./dto/auth-response.dto").AuthResponseDto, "token">>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
