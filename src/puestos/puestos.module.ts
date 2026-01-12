import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuestosService } from './puestos.service';
import { PuestosController } from './puestos.controller';
import { Puesto } from './entities/puesto.entity';
import { CustomHttpModule } from '../common/http/http.module';

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