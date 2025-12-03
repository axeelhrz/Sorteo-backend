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
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
// Cargar .env explícitamente antes de usar las variables
dotenv.config({ path: (0, path_1.resolve)(process.cwd(), '.env') });
const isProduction = process.env.NODE_ENV === 'production';
// Debug: mostrar qué variables están disponibles (sin mostrar contraseñas)
console.log('🔍 Database Configuration Debug:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'set (hidden)' : 'not set'}`);
console.log(`   DATABASE_HOST: ${process.env.DATABASE_HOST || 'not set'}`);
console.log(`   DATABASE_NAME: ${process.env.DATABASE_NAME || 'not set'}`);
// Railway proporciona DATABASE_URL, pero también soportamos variables individuales
let databaseConfig;
if (process.env.DATABASE_URL) {
    // Usar DATABASE_URL si está disponible (formato de Railway)
    // Formato: postgresql://user:password@host:port/database
    // También soporta: postgres://user:password@host:port/database
    try {
        const url = new URL(process.env.DATABASE_URL);
        exports.databaseConfig = databaseConfig = {
            type: 'postgres',
            host: url.hostname,
            port: parseInt(url.port || '5432'),
            username: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.slice(1), // Remover el '/' inicial
            // No especificar entities aquí - se registran en cada módulo con TypeOrmModule.forFeature()
            migrations: [],
            migrationsRun: false,
            synchronize: false,
            logging: process.env.NODE_ENV === 'development',
            ssl: isProduction ? { rejectUnauthorized: false } : false, // SSL requerido en producción (Railway)
        };
        console.log(`✅ Database config from DATABASE_URL:`);
        console.log(`   Host: ${url.hostname}`);
        console.log(`   Port: ${url.port || '5432'}`);
        console.log(`   Database: ${url.pathname.slice(1)}`);
        console.log(`   User: ${url.username}`);
        console.log(`   SSL: ${isProduction ? 'enabled' : 'disabled'}`);
    }
    catch (error) {
        console.error('❌ Error parsing DATABASE_URL:', error);
        throw new Error('Invalid DATABASE_URL format');
    }
}
else {
    // Usar variables individuales (desarrollo local)
    const host = process.env.DATABASE_HOST || 'localhost';
    const port = parseInt(process.env.DATABASE_PORT || '5432');
    const username = process.env.DATABASE_USER || 'postgres';
    const database = process.env.DATABASE_NAME || 'tiketea_online';
    exports.databaseConfig = databaseConfig = {
        type: 'postgres',
        host,
        port,
        username,
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database,
        // No especificar entities aquí - se registran en cada módulo con TypeOrmModule.forFeature()
        migrations: [],
        migrationsRun: false,
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
    };
    console.log(`⚠️  Using individual database variables (DATABASE_URL not found):`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database: ${database}`);
    console.log(`   User: ${username}`);
    console.log(`   ⚠️  Make sure PostgreSQL is running locally or configure DATABASE_URL for Railway`);
}
