import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar .env explícitamente antes de usar las variables
dotenv.config({ path: resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Debug: mostrar qué variables están disponibles (sin mostrar contraseñas)
console.log('🔍 Database Configuration Debug:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'set (hidden)' : 'not set'}`);
console.log(`   DATABASE_HOST: ${process.env.DATABASE_HOST || 'not set'}`);
console.log(`   DATABASE_NAME: ${process.env.DATABASE_NAME || 'not set'}`);

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
    console.log(`✅ Database config from DATABASE_URL:`);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || '5432'}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   User: ${url.username}`);
    console.log(`   SSL: ${isProduction ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error);
    throw new Error('Invalid DATABASE_URL format');
  }
} else {
  // Usar variables individuales (desarrollo local)
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = parseInt(process.env.DATABASE_PORT || '5432');
  const username = process.env.DATABASE_USER || 'postgres';
  const database = process.env.DATABASE_NAME || 'tiketea_online';
  
  databaseConfig = {
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

export { databaseConfig };