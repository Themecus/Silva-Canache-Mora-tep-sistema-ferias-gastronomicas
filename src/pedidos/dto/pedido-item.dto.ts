import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class PedidoItemDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsNumber()
  @Min(1)
  cantidad: number;
}
