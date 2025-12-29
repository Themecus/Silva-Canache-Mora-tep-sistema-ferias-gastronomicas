// src/puestos/puestos.module.ts
import { Module } from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { PuestosController } from './puestos.controller';
import { CustomHttpModule } from '../common/http/http.module'; // AÑADE ESTA LÍNEA

@Module({
  imports: [CustomHttpModule], // AÑADE ESTA LÍNEA
  controllers: [PuestosController],
  providers: [PuestosService],
  exports: [PuestosService],
})
export class PuestosModule {}