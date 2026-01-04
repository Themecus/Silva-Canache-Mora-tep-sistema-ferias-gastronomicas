import { Module } from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { PuestosController } from './puestos.controller';
import { CustomHttpModule } from '../common/http/http.module'; // AÑADE ESTA LÍNEA

@Module({
  imports: [CustomHttpModule], // Importa el HTTP modulo
  controllers: [PuestosController],//controla las rutas
  providers: [PuestosService],//logica de negocio
  exports: [PuestosService],//exporta el servicio donde se requiera
})
export class PuestosModule {}

//organiza y exporta los componenetes relaciones a los puestos