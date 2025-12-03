import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Habilitar CORS con configuración segura
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  // Validación global con opciones de seguridad
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no definidas
      forbidNonWhitelisted: true, // Rechazar propiedades no definidas
      transform: true, // Transformar payloads a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Agregar headers de seguridad manualmente
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.removeHeader('X-Powered-By');
    next();
  });

  const port = process.env.PORT || 3001;
  const nodeEnv = process.env.NODE_ENV || 'development';

  await app.listen(port);
  console.log(`✅ Application is running on port ${port} (${nodeEnv})`);
  console.log(`🔒 Security headers enabled`);
  console.log(`🛡️  CORS configured for: ${process.env.CORS_ORIGIN}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});