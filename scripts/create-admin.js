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
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../src/users/user.entity");
const bcrypt = __importStar(require("bcrypt"));
async function createAdmin() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userRepository = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
    const email = process.env.ADMIN_EMAIL || 'admin@sorteos.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const name = process.env.ADMIN_NAME || 'Administrador';
    // Verificar si ya existe un admin con este email
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        if (existingUser.role === 'admin') {
            console.log('✅ Usuario admin ya existe:', email);
            await app.close();
            return;
        }
        else {
            // Actualizar el rol a admin
            existingUser.role = 'admin';
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUser.password = hashedPassword;
            await userRepository.save(existingUser);
            console.log('✅ Usuario actualizado a admin:', email);
            await app.close();
            return;
        }
    }
    // Crear nuevo usuario admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = userRepository.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
    });
    await userRepository.save(adminUser);
    console.log('✅ Usuario admin creado exitosamente!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Nombre:', name);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión!');
    await app.close();
}
createAdmin().catch((error) => {
    console.error('❌ Error al crear usuario admin:', error);
    process.exit(1);
});
