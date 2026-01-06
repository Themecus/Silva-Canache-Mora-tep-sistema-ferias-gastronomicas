import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto) {
    const producto = this.productoRepository.create(createProductoDto);
    return await this.productoRepository.save(producto);
  }

  async findAll() {
    return await this.productoRepository.find();
  }

  // --- AQUÍ ESTABAN LOS ERRORES (Cambiamos number por string) ---

  async findOne(id: string) {  // <--- CAMBIO AQUÍ
    return await this.productoRepository.findOneBy({ id });
  }

  async update(id: string, updateProductoDto: UpdateProductoDto) { // <--- CAMBIO AQUÍ
    await this.productoRepository.update(id, updateProductoDto);
    return await this.productoRepository.findOneBy({ id });
  }

  async remove(id: string) { // <--- CAMBIO AQUÍ
    return await this.productoRepository.delete(id);
  }
}