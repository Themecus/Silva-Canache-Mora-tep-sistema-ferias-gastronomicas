import { Module } from '@nestjs/common';
import { PuestosModule } from './puestos/puestos.module';
import { AppController } from './app.controller';
// Este archivo se encarga de importa todos los demás módulos y declara controladores globales.
@Module({
  imports: [PuestosModule],//importa
  controllers: [AppController],//controladores globales
})
export class AppModule {}