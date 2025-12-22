// src/puestos/puestos.module.ts
import { Module } from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { PuestosController } from './puestos.controller';

@Module({
  controllers: [PuestosController],
  providers: [PuestosService],
  exports: [PuestosService],  // 👈 Exportamos para posible uso en otros módulos
})
export class PuestosModule {}