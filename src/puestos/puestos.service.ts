import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { Puesto } from './entities/puesto.entity';
import { CustomHttpService } from '../common/http/http.service';

@Injectable()
export class PuestosService {
  constructor(
    @InjectRepository(Puesto)
    private puestoRepository: Repository<Puesto>,
    private readonly httpService: CustomHttpService,
  ) {
    console.log('PuestosService inicializado con TypeORM');
  }

  // Método para validar y extraer usuario 
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

  // creamos los puestos
  async create(createPuestoDto: CreatePuestoDto, token: string): Promise<Puesto> {
    console.log('Creando puesto con token real...');
    
    const usuario = await this.validarYExtraerUsuario(token);
    
    if (usuario.rol !== 'emprendedor') {
      throw new BadRequestException(`Solo emprendedores pueden crear puestos. Tu rol es: ${usuario.rol}`);
    }

    const puestoExistente = await this.puestoRepository.findOne({
      where: { emprendedorId: usuario.id }
    });

    if (puestoExistente) {
      throw new BadRequestException('El emprendedor ya tiene un puesto registrado');
    }

    const puesto = this.puestoRepository.create({
      nombre: createPuestoDto.nombre,
      color: createPuestoDto.color,
      emprendedorId: usuario.id,
      estado: 'pendiente',
      disponible: false,
    });
    
    return await this.puestoRepository.save(puesto);
  }

  // buscar a todos los puestos
  async findAll(): Promise<Puesto[]> {
    return await this.puestoRepository.find();
  }

  // buscar puestos por ID
  async findOne(id: string): Promise<Puesto> {
    const puesto = await this.puestoRepository.findOne({ where: { id } });
    if (!puesto) {
      throw new NotFoundException(`Puesto con ID ${id} no encontrado`);
    }
    return puesto;
  }

  // buscar puestos por emprendedor
  async findByEmprendedor(emprendedorId: string): Promise<Puesto[]> {
    return await this.puestoRepository.find({ 
      where: { emprendedorId } 
    });
  }

  // buscar puestos por estado
  async findByEstado(estado: string): Promise<Puesto[]> {
    return await this.puestoRepository.find({ 
      where: { estado } 
    });
  }

  // buscar puestos por activos
  async findActivos(): Promise<Puesto[]> {
    return await this.puestoRepository.find({ 
      where: { 
        estado: 'activo',
        disponible: true 
      } 
    });
  }

  // modifica o actualiza el puesto
  async update(id: string, updatePuestoDto: UpdatePuestoDto, usuarioId: string): Promise<Puesto> {
    const puesto = await this.findOne(id);
    
    // Verificar permisos usando el método de la entidad
    if (puesto.emprendedorId !== usuarioId) {
      throw new BadRequestException('Solo el dueño puede editar este puesto');
    }
    
    if (puesto.estado === 'activo') {
      throw new BadRequestException('No se puede editar un puesto activo');
    }
    
    // Actualizar campos
    if (updatePuestoDto.nombre) {
      puesto.nombre = updatePuestoDto.nombre;
    }
    
    if (updatePuestoDto.color) {
      puesto.color = updatePuestoDto.color;
    }
    
    puesto.actualizadoEn = new Date();
    return await this.puestoRepository.save(puesto);
  }

  // borra el puesto
  async remove(id: string, usuarioId: string): Promise<void> {
    const puesto = await this.findOne(id);
    
    if (puesto.emprendedorId !== usuarioId) {
      throw new BadRequestException('Solo el dueño puede eliminar este puesto');
    }
    
    if (puesto.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden eliminar puestos en estado pendiente');
    }
    
    await this.puestoRepository.remove(puesto);
  }

  // modifica el estado del puesto
  async cambiarEstado(id: string, cambiarEstadoDto: CambiarEstadoDto, usuarioId: string, usuarioRol: string): Promise<Puesto> {
    const puesto = await this.findOne(id);
    
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
        if (puesto.estado !== 'aprobado' && puesto.estado !== 'inactivo') {
          throw new BadRequestException('Solo se pueden activar puestos aprobados o inactivos');
        }
        puesto.activar();
        break;
        
      case 'inactivo':
        if (usuarioRol === 'emprendedor' && puesto.emprendedorId !== usuarioId) {
          throw new BadRequestException('No puedes inactivar un puesto que no es tuyo');
        }
        puesto.inactivar();
        break;
        
      default:
        throw new BadRequestException('Estado no válido');
    }
    
    return await this.puestoRepository.save(puesto);
  }

  // revisa si esta activo
  async verificarPuestoActivo(puestoId: string): Promise<{ activo: boolean; puesto?: Puesto }> {
    try {
      const puesto = await this.findOne(puestoId);
      return {
        activo: puesto.estado === 'activo' && puesto.disponible === true,
        puesto
      };
    } catch {
      return { activo: false };
    }
  }

  // revisa propiedad del puesto
  async verificarPropiedad(puestoId: string, emprendedorId: string): Promise<boolean> {
    try {
      const puesto = await this.findOne(puestoId);
      return puesto.emprendedorId === emprendedorId;
    } catch {
      return false;
    }
  }

  // valida pedido
  async validarPuestoParaPedido(puestoId: string): Promise<{ valido: boolean; motivo?: string }> {
    try {
      const puesto = await this.findOne(puestoId);
      
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

//Aqui usaremos los endpoints que preparamos en controller