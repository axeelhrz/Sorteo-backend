import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Railway proporciona DATABASE_URL, pero también soportamos variables individuales
let databaseConfig: DataSourceOptions;

if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL si está disponible (formato de Railway)
  // Formato: postgresql://user:password@host:port/database
  // También soporta: postgres://user:password@host:port/database
  try {
    const url = new URL(process.env.DATABASE_URL);
    databaseConfig = {
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
    console.log(`✅ Database config from DATABASE_URL: ${url.hostname}:${url.port}/${url.pathname.slice(1)}`);
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error);
    throw new Error('Invalid DATABASE_URL format');
  }
} else {
  // Usar variables individuales (desarrollo local)
  databaseConfig = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'tiketea_online',
    // No especificar entities aquí - se registran en cada módulo con TypeOrmModule.forFeature()
    migrations: [],
    migrationsRun: false,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
  };
}

export { databaseConfig };