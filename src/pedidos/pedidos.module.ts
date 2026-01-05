import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, DetallePedido])],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
