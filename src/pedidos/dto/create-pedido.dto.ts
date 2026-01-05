import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class PedidoItemDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsNumber()
  @Min(1)
  cantidad: number;
}

export class CreatePedidoDto {
  @IsString()
  @IsNotEmpty()
  puestoId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];
}
