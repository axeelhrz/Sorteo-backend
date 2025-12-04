"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Servir archivos estáticos desde la carpeta uploads
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads',
    });
    // Habilitar CORS con configuración segura
    // Soporta múltiples orígenes separados por coma
    const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : ['http://localhost:3000'];
    // Manejar peticiones OPTIONS (preflight) explícitamente ANTES de habilitar CORS
    app.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
            const origin = req.headers.origin;
            if (origin && allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Max-Age', '3600');
                res.status(204).end();
                return;
            }
            else if (!origin) {
                // Permitir requests sin origin
                res.status(204).end();
                return;
            }
            else {
                console.warn(`⚠️  CORS preflight blocked origin: ${origin}`);
                res.status(403).end();
                return;
            }
        }
        next();
    });
    // IMPORTANTE: CORS debe estar ANTES de otros middlewares
    app.enableCors({
        origin: (origin, callback) => {
            // Permitir requests sin origin (como Postman, mobile apps, etc.)
            if (!origin)
                return callback(null, true);
            // Verificar si el origin está en la lista permitida
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                console.warn(`⚠️  CORS blocked origin: ${origin}`);
                console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 3600,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    // Validación global con opciones de seguridad
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true, // Remover propiedades no definidas
        forbidNonWhitelisted: false, // No rechazar propiedades no definidas (se validan manualmente en los controladores)
        transform: true, // Transformar payloads a instancias de DTO
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // Agregar headers de seguridad manualmente
    // IMPORTANTE: Este middleware debe ejecutarse DESPUÉS de CORS
    // y NO debe interferir con las peticiones OPTIONS
    app.use((_req, res, next) => {
        // No aplicar headers de seguridad a peticiones OPTIONS (preflight)
        if (_req.method === 'OPTIONS') {
            return next();
        }
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
    console.log(`🛡️  CORS configured for: ${allowedOrigins.join(', ')}`);
}
bootstrap().catch((error) => {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
});
