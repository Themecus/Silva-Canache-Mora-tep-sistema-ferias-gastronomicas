import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  const port = 3002;
  
  await app.listen(port);
  
  console.log('========================================');
  console.log('MICROSERVICIO DE USUARIOS INICIADO');
  console.log('URL: http://localhost:' + port);
  console.log('========================================');
  console.log('');
  console.log('USUARIOS POR DEFECTO:');
  console.log('   Organizador:');
  console.log('      Email: admin@feria.com');
  console.log('      Password: admin123');
  console.log('');
  console.log('   Cliente:');
  console.log('      Email: cliente@ejemplo.com');
  console.log('      Password: cliente123');
  console.log('');
  console.log('   Emprendedor:');
  console.log('      Email: emprendedor@ejemplo.com');
  console.log('      Password: emprendedor123');
  console.log('');
  console.log('ENDPOINTS PRINCIPALES:');
  console.log('   POST /usuarios/registro     - Registrar nuevo usuario');
  console.log('   POST /usuarios/login        - Iniciar sesion (obtener token)');
  console.log('   GET  /usuarios/perfil       - Ver perfil (requiere token)');
  console.log('   GET  /usuarios/validar-token - Validar token');
  console.log('   POST /usuarios              - Crear usuario (admin)');
  console.log('   GET  /usuarios              - Listar usuarios');
  console.log('');
  console.log('ENDPOINTS PARA OTROS MICROSERVICIOS:');
  console.log('   GET /usuarios/verificar/{usuarioId}/{rol}');
  console.log('   GET /usuarios/validar/{rol}');
  console.log('========================================');
}
bootstrap();