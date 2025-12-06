// esta parte solo saldra en la consola del VS
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  const port = 3000;
  await app.listen(port);
  
  console.log(`✅ Microservicio corriendo en: http://localhost:${port}`);
  console.log(`📦 Endpoints:`);
  console.log(`   POST   http://localhost:${port}/puestos`);
  console.log(`   GET    http://localhost:${port}/puestos`);
  console.log(`   GET    http://localhost:${port}/puestos/:id`);
  console.log(`   PATCH  http://localhost:${port}/puestos/:id`);
  console.log(`   DELETE http://localhost:${port}/puestos/:id`);
}
bootstrap();