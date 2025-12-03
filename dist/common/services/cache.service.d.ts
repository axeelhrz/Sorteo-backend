export declare class CacheService {
    private cache;
    private readonly defaultTTL;
    /**
     * Obtener valor del cache
     */
    get<T>(key: string): T | null;
    /**
     * Guardar valor en cache
     */
    set<T>(key: string, data: T, ttlMs?: number): void;
    /**
     * Eliminar valor del cache
     */
    delete(key: string): void;
    /**
     * Limpiar cache por patrón (ej: "raffle:*")
     */
    deleteByPattern(pattern: string): void;
    /**
     * Limpiar todo el cache
     */
    clear(): void;
    /**
     * Obtener o generar valor en cache
     */
    getOrSet<T>(key: string, generator: () => Promise<T>, ttlMs?: number): Promise<T>;
    /**
     * Obtener estadísticas del cache
     */
    getStats(): {
        size: number;
        keys: string[];
    };
}
