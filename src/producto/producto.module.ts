import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Importar esto
import { Producto } from './entities/producto.entity'; // <--- Importar tu entidad

@Module({
  imports: [TypeOrmModule.forFeature([Producto])], // <--- ¡AGREGA ESTA LÍNEA!
  controllers: [ProductoController],
  providers: [ProductoService],
})
export class ProductoModule {}