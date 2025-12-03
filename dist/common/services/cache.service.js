"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
let CacheService = class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto
    }
    /**
     * Obtener valor del cache
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Verificar si expiró
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    /**
     * Guardar valor en cache
     */
    set(key, data, ttlMs) {
        const expiresAt = Date.now() + (ttlMs || this.defaultTTL);
        this.cache.set(key, { data, expiresAt });
    }
    /**
     * Eliminar valor del cache
     */
    delete(key) {
        this.cache.delete(key);
    }
    /**
     * Limpiar cache por patrón (ej: "raffle:*")
     */
    deleteByPattern(pattern) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }
    /**
     * Limpiar todo el cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Obtener o generar valor en cache
     */
    async getOrSet(key, generator, ttlMs) {
        const cached = this.get(key);
        if (cached) {
            return cached;
        }
        const data = await generator();
        this.set(key, data, ttlMs);
        return data;
    }
    /**
     * Obtener estadísticas del cache
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)()
], CacheService);
