import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { Puesto } from './entities/puesto.entity';
import { CustomHttpService } from '../common/http/http.service';

@Injectable()
export class PuestosService {
  private puestos: Puesto[] = [];

  constructor(private readonly httpService: CustomHttpService) {
    console.log('PuestosService inicializado con HTTP Service');
  }


  //valida tokens y extrae infromacion de usuario
  private async validarYExtraerUsuario(token: string): Promise<{ id: string; rol: string; email: string }> {
    console.log('Validando token para operación...');
    
    if (!token || token === 'null' || token === 'undefined') {
      throw new BadRequestException('Token no proporcionado');
    }

    const validacion = await this.httpService.validarToken(token);
    
    if (!validacion || !validacion.valido) {
      console.log('Token inválido:', validacion);
      throw new BadRequestException('Token inválido o expirado');
    }

    console.log('Token válido para usuario:', validacion.usuario.email);
    
    return {
      id: validacion.usuario.id,
      rol: validacion.usuario.rol,
      email: validacion.usuario.email
    };
  }

  //crea puestos
  async create(createPuestoDto: CreatePuestoDto, token: string): Promise<Puesto> {
    console.log('Creando puesto con token real...');
    
    const usuario = await this.validarYExtraerUsuario(token);
    
    if (usuario.rol !== 'emprendedor') {
      throw new BadRequestException(`Solo emprendedores pueden crear puestos. Tu rol es: ${usuario.rol}`);
    }

    const puestoExistente = this.puestos.find(
      p => p.emprendedorId === usuario.id
    );

    if (puestoExistente) {
      throw new BadRequestException('El emprendedor ya tiene un puesto registrado');
    }

    const puesto = new Puesto(
      createPuestoDto.nombre,
      createPuestoDto.color,
      usuario.id
    );
    
    this.puestos.push(puesto);
    console.log('Puesto creado para usuario:', usuario.email);
    return puesto;
  }

  //busca todos los puestos
  findAll(): Puesto[] {
    return this.puestos;
  }
  //busca por ID
  findOne(id: string): Puesto {
    const puesto = this.puestos.find(puesto => puesto.id === id);
    if (!puesto) {
      throw new NotFoundException(`Puesto con ID ${id} no encontrado`);
    }
    return puesto;
  }
  //Busca por emprendedor
  findByEmprendedor(emprendedorId: string): Puesto[] {
    return this.puestos.filter(puesto => puesto.emprendedorId === emprendedorId);
  }
  //busca por estado
  findByEstado(estado: string): Puesto[] {
    return this.puestos.filter(puesto => puesto.estado === estado);
  }
  //Busca los activos
  findActivos(): Puesto[] {
    return this.puestos.filter(puesto => 
      puesto.estado === 'activo' && puesto.disponible === true
    );
  }

  //actualiza puestos que existan
  update(id: string, updatePuestoDto: UpdatePuestoDto, usuarioId: string): Puesto {
    const puesto = this.findOne(id);
    
    if (!puesto.puedeEditar(usuarioId)) {
      throw new BadRequestException('Solo el dueño puede editar este puesto');
    }
    
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
  //borra un puesto
  remove(id: string, usuarioId: string): void {
    const puesto = this.findOne(id);
    
    if (!puesto.puedeEditar(usuarioId)) {
      throw new BadRequestException('Solo el dueño puede eliminar este puesto');
    }
    
    if (puesto.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden eliminar puestos en estado pendiente');
    }
    
    const index = this.puestos.findIndex(puesto => puesto.id === id);
    this.puestos.splice(index, 1);
  }
  //cambia el estado del puesto
  cambiarEstado(id: string, cambiarEstadoDto: CambiarEstadoDto, usuarioId: string, usuarioRol: string): Puesto {
    const puesto = this.findOne(id);
    
    switch (cambiarEstadoDto.estado) {
      case 'aprobado':
        if (usuarioRol !== 'organizador') {
          throw new BadRequestException('Solo organizadores pueden aprobar puestos');
        }
        if (puesto.estado !== 'pendiente') {
          throw new BadRequestException('Solo se pueden aprobar puestos pendientes');
        }
        puesto.aprobar(usuarioId);
        break;
        
      case 'activo':
        if (usuarioRol !== 'organizador') {
          throw new BadRequestException('Solo organizadores pueden activar puestos');
        }
        if (puesto.estado !== 'aprobado') {
          throw new BadRequestException('Solo se pueden activar puestos aprobados');
        }
        puesto.activar();
        break;
        
      case 'inactivo':
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

  //verifica si el estado de un puesto es activo  
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
  //verifica si un emprendedor es dueno de un puesto
  verificarPropiedad(puestoId: string, emprendedorId: string): boolean {
    try {
      const puesto = this.findOne(puestoId);
      return puesto.emprendedorId === emprendedorId;
    } catch {
      return false;
    }
  }
  //verifica si un puesto puede recibir pedidos
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

//aqui en este .ts se gestiona todo lo que seria: CRUD, validacion de permisos, cambios de estado, comunicacion