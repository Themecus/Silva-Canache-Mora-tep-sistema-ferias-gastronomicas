import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';
import { IsBoolean, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateProductoDto extends PartialType(
  OmitType(CreateProductoDto, ['stallId', 'entrepreneurId'] as const),
) {
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsUUID()
  @IsNotEmpty()
  entrepreneurId: string;
}