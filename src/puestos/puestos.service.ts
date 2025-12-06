// src/puestos/puestos.service.ts
import { Injectable } from '@nestjs/common';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { Puesto } from './entities/puesto.entity';

@Injectable()
export class PuestosService {
  private puestos: Puesto[] = [];  // Array en memoria

  // 1. CREAR puesto
  create(createPuestoDto: CreatePuestoDto): Puesto {
    const puesto = new Puesto(
      createPuestoDto.nombre,
      createPuestoDto.color
    );
    this.puestos.push(puesto);
    return puesto;
  }

  // 2. OBTENER todos
  findAll(): Puesto[] {
    return this.puestos;
  }

  // 3. OBTENER uno por ID
  findOne(id: string): Puesto {
    return this.puestos.find(puesto => puesto.id === id);
  }

  // 4. ACTUALIZAR
  update(id: string, updatePuestoDto: UpdatePuestoDto): Puesto {
    const puesto = this.findOne(id);
    if (!puesto) return null;
    
    if (updatePuestoDto.nombre) {
      puesto.nombre = updatePuestoDto.nombre;
    }
    
    if (updatePuestoDto.color) {
      puesto.color = updatePuestoDto.color;
    }
    
    return puesto;
  }

  // 5. ELIMINAR
  remove(id: string): void {
    const index = this.puestos.findIndex(puesto => puesto.id === id);
    if (index > -1) {
      this.puestos.splice(index, 1);
    }
  }
}