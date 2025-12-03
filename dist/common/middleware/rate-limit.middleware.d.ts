import { NestMiddleware } from '@nestjs/common';
import { Request, NextFunction } from 'express';
export declare class RateLimitMiddleware implements NestMiddleware {
    private store;
    private readonly windowMs;
    private readonly maxRequests;
    use(req: Request, _res: any, next: NextFunction): void;
}
export declare class LoginRateLimitMiddleware implements NestMiddleware {
    private store;
    private readonly windowMs;
    private readonly maxAttempts;
    use(req: Request, _res: any, next: NextFunction): void;
}
export declare class TicketPurchaseRateLimitMiddleware implements NestMiddleware {
    private store;
    private readonly windowMs;
    private readonly maxPurchases;
    use(req: Request, _res: any, next: NextFunction): void;
}
