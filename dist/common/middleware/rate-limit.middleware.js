"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketPurchaseRateLimitMiddleware = exports.LoginRateLimitMiddleware = exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RateLimitMiddleware = class RateLimitMiddleware {
    constructor() {
        this.store = {};
        this.windowMs = 15 * 60 * 1000; // 15 minutos
        this.maxRequests = 100; // máximo de requests por ventana
    }
    use(req, _res, next) {
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
            throw new common_1.HttpException(`Too many requests from ${req.ip}, please try again later.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        next();
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)()
], RateLimitMiddleware);
// Rate limiter específico para login
let LoginRateLimitMiddleware = class LoginRateLimitMiddleware {
    constructor() {
        this.store = {};
        this.windowMs = 15 * 60 * 1000; // 15 minutos
        this.maxAttempts = 5; // máximo de intentos de login
    }
    use(req, _res, next) {
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
            throw new common_1.HttpException(`Too many login attempts for ${email}. Please try again after 15 minutes.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        next();
    }
};
exports.LoginRateLimitMiddleware = LoginRateLimitMiddleware;
exports.LoginRateLimitMiddleware = LoginRateLimitMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoginRateLimitMiddleware);
// Rate limiter específico para compra de tickets
let TicketPurchaseRateLimitMiddleware = class TicketPurchaseRateLimitMiddleware {
    constructor() {
        this.store = {};
        this.windowMs = 60 * 1000; // 1 minuto
        this.maxPurchases = 10; // máximo de compras por minuto
    }
    use(req, _res, next) {
        const userId = req.user?.sub || req.ip;
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
            throw new common_1.HttpException(`Too many ticket purchases. Please try again after 1 minute.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        next();
    }
};
exports.TicketPurchaseRateLimitMiddleware = TicketPurchaseRateLimitMiddleware;
exports.TicketPurchaseRateLimitMiddleware = TicketPurchaseRateLimitMiddleware = __decorate([
    (0, common_1.Injectable)()
], TicketPurchaseRateLimitMiddleware);
