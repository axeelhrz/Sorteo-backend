import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15 minutos
  private readonly maxRequests = 100; // máximo de requests por ventana

  use(req: Request, _res: any, next: NextFunction) {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();

    if (!this.store[key]) {
      this.store[key] = { count: 1, resetTime: now + this.windowMs };
      return next();
    }

    const record = this.store[key];

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + this.windowMs;
      return next();
    }

    record.count++;

    if (record.count > this.maxRequests) {
      throw new HttpException(
        `Too many requests from ${req.ip}, please try again later.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }
}

// Rate limiter específico para login
@Injectable()
export class LoginRateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15 minutos
  private readonly maxAttempts = 5; // máximo de intentos de login

  use(req: Request, _res: any, next: NextFunction) {
    const email = req.body?.email || req.ip;
    const key = `login-${email}`;
    const now = Date.now();

    if (!this.store[key]) {
      this.store[key] = { count: 1, resetTime: now + this.windowMs };
      return next();
    }

    const record = this.store[key];

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + this.windowMs;
      return next();
    }

    record.count++;

    if (record.count > this.maxAttempts) {
      throw new HttpException(
        `Too many login attempts for ${email}. Please try again after 15 minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }
}

// Rate limiter específico para compra de tickets
@Injectable()
export class TicketPurchaseRateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = 60 * 1000; // 1 minuto
  private readonly maxPurchases = 10; // máximo de compras por minuto

  use(req: Request, _res: any, next: NextFunction) {
    const userId = (req.user as any)?.sub || req.ip;
    const key = `ticket-purchase-${userId}`;
    const now = Date.now();

    if (!this.store[key]) {
      this.store[key] = { count: 1, resetTime: now + this.windowMs };
      return next();
    }

    const record = this.store[key];

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + this.windowMs;
      return next();
    }

    record.count++;

    if (record.count > this.maxPurchases) {
      throw new HttpException(
        `Too many ticket purchases. Please try again after 1 minute.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }
}