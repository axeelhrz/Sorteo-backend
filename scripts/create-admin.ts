import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

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
    } else {
      // Actualizar el rol a admin
      existingUser.role = 'admin' as any;
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
    role: 'admin' as any,
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

