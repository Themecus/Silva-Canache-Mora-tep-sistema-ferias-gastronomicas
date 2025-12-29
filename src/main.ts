// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');
  
  const port = 3000;
  
  await app.listen(port);
  
  console.log('========================================');
  console.log('🚀 SISTEMA DE FERIAS GASTRONÓMICAS');
  console.log('📡 URL: http://localhost:' + port + '/api');
  console.log('========================================');
  console.log('');
  console.log('📋 ENDPOINTS PRINCIPALES:');
  console.log('');
  console.log('👤 USUARIOS Y AUTENTICACIÓN:');
  console.log('   POST   /api/usuarios/registro');
  console.log('   POST   /api/usuarios/login');
  console.log('   GET    /api/usuarios/perfil     (con Authorization header)');
  console.log('   GET    /api/usuarios/validar-token');
  console.log('');
  console.log('🏪 PUESTOS GASTRONÓMICOS:');
  console.log('   POST   /api/puestos             (emprendedores)');
  console.log('   GET    /api/puestos');
  console.log('   GET    /api/puestos/activos');
  console.log('   PATCH  /api/puestos/:id/estado  (cambiar estado)');
  console.log('');
  console.log('🔑 USUARIOS POR DEFECTO:');
  console.log('   Organizador:  admin@feria.com / admin123');
  console.log('   Cliente:      cliente@ejemplo.com / cliente123');
  console.log('   Emprendedor:  emprendedor@ejemplo.com / emprendedor123');
  console.log('');
  console.log('📊 PARA MÁS INFORMACIÓN:');
  console.log('   GET /api/ - Documentación completa de endpoints');
  console.log('========================================');
}
bootstrap();