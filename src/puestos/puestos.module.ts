import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';// con esto integramos el typeORM
import { PuestosService } from './puestos.service';//integramos el .tx de puestos dedicado a los servicios
import { PuestosController } from './puestos.controller';// este al control de lo puestos
import { Puesto } from './entities/puesto.entity';//la entidad que representa puestos en la base de datos de postgre
import { CustomHttpModule } from '../common/http/http.module';//esto es para las perticiones entre servicios

@Module({
  imports: [
    TypeOrmModule.forFeature([Puesto]), // Registrar entidad
    CustomHttpModule,
  ],
  controllers: [PuestosController],
  providers: [PuestosService],
  exports: [PuestosService],
})
export class PuestosModule {}
// este .ts configura las dependencias necesarias para el funcionamiento del módulo