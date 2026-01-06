//export class CreateProductoDto {}
import { IsString, IsNumber, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsUUID()
  stallId: string;
    
  @IsUUID()
  entrepreneurId: string;
}