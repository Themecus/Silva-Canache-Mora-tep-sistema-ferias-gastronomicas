import { Module } from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { PuestosController } from './puestos.controller';
//aqui solo se encargara de exportar los compoenentes de puestos

@Module({
  controllers: [PuestosController],//manejha las rutas
  providers: [PuestosService],//logica de neogico
  exports: [PuestosService],  // Exportacion
})
export class PuestosModule {}