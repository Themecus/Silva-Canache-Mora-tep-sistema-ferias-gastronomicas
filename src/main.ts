
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//esto sera nuestro punto de entrada para aplicacion

async function bootstrap() {
  const app = await NestFactory.create(AppModule);//crea la aplicacio n nest usando el modulo raiz
  //habilita las peticiones desde otro dominio
  app.enableCors();
  
  
  const port = 3001;  // el puerto a usar
  //arranca el server
  await app.listen(port);
  
  //toda esta parte de abajo solo es para uso de desarrolladores

  console.log('MICROSERVICIO DE PUESTOS - COMPLETO');
  console.log(`URL: http://localhost:${port}`);

  console.log('');
  console.log('FUNCIONALIDADES IMPLEMENTADAS:');
  console.log('1. Creación de puestos (emprendedores)');
  console.log('2. Edición de puestos (solo dueño)');
  console.log('3. Activación/Inactivación (emprendedores/organizadores)');
  console.log('4. Estados: pendiente → aprobado → activo');
  console.log('5. Asociación emprendedor-puesto');
  console.log('6. Validación de propiedad (solo dueño puede gestionar)');
  console.log('7. Lógica de aprobación (solo organizadores)');
  console.log('');
  console.log('COMUNICACIÓN CON MICROSERVICIO 1 (SIMULADA):');
  console.log('- Headers: x-user-id, x-user-rol');
  console.log('- Roles: emprendedor, organizador, cliente');
  console.log('');
  console.log('ENDPOINTS PARA API GATEWAY:');
  console.log('GET  /puestos/:id/verificar-activo');
  console.log('GET  /puestos/:id/verificar-propiedad/:emprendedorId');
  console.log('GET  /puestos/:id/validar-para-pedido');
  console.log('');
  console.log('PRUEBAS EN POSTMAN (usar headers simulados):');
  console.log('1. Crear puesto: x-user-id: emp-123, x-user-rol: emprendedor');
  console.log(' 2. Aprobar puesto: x-user-id: org-456, x-user-rol: organizador');

}
bootstrap();