import { IsEnum, IsOptional } from 'class-validator';
import { EstadoPedido } from '../entities/pedido.entity';

export class UpdatePedidoDto {
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;
}
