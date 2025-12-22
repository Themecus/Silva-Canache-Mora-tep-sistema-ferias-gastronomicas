// src/puestos/puestos.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { Puesto } from './entities/puesto.entity';

@Injectable()
export class PuestosService {
  private puestos: Puesto[] = [];

  // ============ CRUD BÁSICO ============
  
  create(createPuestoDto: CreatePuestoDto): Puesto {
    // 🔴 FUTURO: Verificar con microservicio 1 que emprendedorId existe
    // 🔴 FUTURO: Verificar que el usuario tenga rol 'emprendedor'
    
    const puesto = new Puesto(
      createPuestoDto.nombre,
      createPuestoDto.color,
      createPuestoDto.emprendedorId
    );
    
    this.puestos.push(puesto);
    return puesto;
  }

  findAll(): Puesto[] {
    return this.puestos;
  }

  findOne(id: string): Puesto {
    const puesto = this.puestos.find(puesto => puesto.id === id);
    if (!puesto) {
      throw new NotFoundException(`Puesto con ID ${id} no encontrado`);
    }
    return puesto;
  }

  // ============ FUNCIONALIDADES ESPECÍFICAS ============
  
  // 1. Editar puesto (solo dueño)
  update(id: string, updatePuestoDto: UpdatePuestoDto, usuarioId: string): Puesto {
    const puesto = this.findOne(id);
    
    // 🔴 FUTURO: Verificar con microservicio 1 el token/rol
    if (!puesto.puedeEditar(usuarioId)) {
      throw new BadRequestException('Solo el dueño puede editar este puesto');
    }
    
    // Validar que no se edite si está activo
    if (puesto.estado === 'activo') {
      throw new BadRequestException('No se puede editar un puesto activo');
    }
    
    if (updatePuestoDto.nombre) {
      puesto.nombre = updatePuestoDto.nombre;
    }
    
    if (updatePuestoDto.color) {
      puesto.color = updatePuestoDto.color;
    }
    
    puesto.actualizadoEn = new Date();
    return puesto;
  }

  // 2. Cambiar estado (aprobación/activación/inactivación)
  cambiarEstado(id: string, cambiarEstadoDto: CambiarEstadoDto, usuarioId: string, usuarioRol: string): Puesto {
    const puesto = this.findOne(id);
    
    // 🔴 FUTURO: Verificar con microservicio 1 el token/rol
    
    switch (cambiarEstadoDto.estado) {
      case 'aprobado':
        // Solo organizadores pueden aprobar
        if (usuarioRol !== 'organizador') {
          throw new BadRequestException('Solo organizadores pueden aprobar puestos');
        }
        if (puesto.estado !== 'pendiente') {
          throw new BadRequestException('Solo se pueden aprobar puestos pendientes');
        }
        puesto.aprobar(usuarioId);
        break;
        
      case 'activo':
        // Solo organizadores pueden activar
        if (usuarioRol !== 'organizador') {
          throw new BadRequestException('Solo organizadores pueden activar puestos');
        }
        if (puesto.estado !== 'aprobado') {
          throw new BadRequestException('Solo se pueden activar puestos aprobados');
        }
        puesto.activar();
        break;
        
      case 'inactivo':
        // Emprendedores pueden inactivar sus puestos
        // Organizadores pueden inactivar cualquier puesto
        if (usuarioRol === 'emprendedor' && !puesto.puedeEditar(usuarioId)) {
          throw new BadRequestException('No puedes inactivar un puesto que no es tuyo');
        }
        puesto.inactivar();
        break;
        
      default:
        throw new BadRequestException('Estado no válido');
    }
    
    return puesto;
  }

  remove(id: string, usuarioId: string): void {
    const puesto = this.findOne(id);
    
    // Solo dueño puede eliminar
    if (!puesto.puedeEditar(usuarioId)) {
      throw new BadRequestException('Solo el dueño puede eliminar este puesto');
    }
    
    // Solo se puede eliminar si está pendiente
    if (puesto.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden eliminar puestos en estado pendiente');
    }
    
    const index = this.puestos.findIndex(puesto => puesto.id === id);
    this.puestos.splice(index, 1);
  }

  // ============ CONSULTAS ESPECIALES ============
  
  // Puestos de un emprendedor específico
  findByEmprendedor(emprendedorId: string): Puesto[] {
    return this.puestos.filter(puesto => puesto.emprendedorId === emprendedorId);
  }

  // Puestos por estado (para organizadores)
  findByEstado(estado: string): Puesto[] {
    return this.puestos.filter(puesto => puesto.estado === estado);
  }

  // Puestos activos (para catálogo público)
  findActivos(): Puesto[] {
    return this.puestos.filter(puesto => 
      puesto.estado === 'activo' && puesto.disponible === true
    );
  }

  // ============ PARA COMUNICACIÓN CON OTROS MICROSERVICIOS ============
  
  // Para microservicio de productos: verificar si puesto está activo
  verificarPuestoActivo(puestoId: string): { activo: boolean; puesto?: Puesto } {
    try {
      const puesto = this.findOne(puestoId);
      return {
        activo: puesto.estado === 'activo' && puesto.disponible === true,
        puesto
      };
    } catch {
      return { activo: false };
    }
  }

  // Para microservicio de productos: verificar propiedad
  verificarPropiedad(puestoId: string, emprendedorId: string): boolean {
    try {
      const puesto = this.findOne(puestoId);
      return puesto.emprendedorId === emprendedorId;
    } catch {
      return false;
    }
  }

  // 🔴 FUTURO: Endpoint para API Gateway/comunicación entre microservicios
  // Este endpoint sería llamado por el API Gateway u otros microservicios
  validarPuestoParaPedido(puestoId: string): { valido: boolean; motivo?: string } {
    try {
      const puesto = this.findOne(puestoId);
      
      if (puesto.estado !== 'activo') {
        return { valido: false, motivo: 'Puesto no está activo' };
      }
      
      if (!puesto.disponible) {
        return { valido: false, motivo: 'Puesto no disponible' };
      }
      
      return { valido: true };
    } catch {
      return { valido: false, motivo: 'Puesto no encontrado' };
    }
  }
}