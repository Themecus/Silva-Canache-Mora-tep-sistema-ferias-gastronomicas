// src/puestos/puestos.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  Headers,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@Controller('puestos')
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}

  // ============ CRUD CON VALIDACIÓN SIMULADA ============
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPuestoDto: CreatePuestoDto,
    @Headers('x-user-id') userId: string,  // 👈 SIMULACIÓN: usuario del token
    @Headers('x-user-rol') userRol: string  // 👈 SIMULACIÓN: rol del usuario
  ) {
    // 🔴 FUTURO: Este header vendría del API Gateway después de validar JWT
    // 🔴 FUTURO: Verificar con microservicio 1 que el usuario existe y es emprendedor
    
    if (!userId) {
      return { error: 'Se requiere autenticación' };
    }
    
    if (userRol !== 'emprendedor') {
      return { error: 'Solo emprendedores pueden crear puestos' };
    }
    
    // Forzar que el emprendedorId sea el usuario autenticado
    createPuestoDto.emprendedorId = userId;
    
    return this.puestosService.create(createPuestoDto);
  }

  @Get()
  findAll(@Query('estado') estado?: string) {
    if (estado) {
      return this.puestosService.findByEstado(estado);
    }
    return this.puestosService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.puestosService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puestosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updatePuestoDto: UpdatePuestoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    // 🔴 FUTURO: Validación real con microservicio 1
    if (!userId) {
      return { error: 'Se requiere autenticación' };
    }
    
    return this.puestosService.update(id, updatePuestoDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    // 🔴 FUTURO: Validación real con microservicio 1
    if (!userId) {
      return { error: 'Se requiere autenticación' };
    }
    
    return this.puestosService.remove(id, userId);
  }

  // ============ ENDPOINTS ESPECÍFICOS ============
  
  @Get('emprendedor/:emprendedorId')
  findByEmprendedor(@Param('emprendedorId') emprendedorId: string) {
    return this.puestosService.findByEmprendedor(emprendedorId);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string, 
    @Body() cambiarEstadoDto: CambiarEstadoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    // 🔴 FUTURO: Validación real con microservicio 1
    if (!userId) {
      return { error: 'Se requiere autenticación' };
    }
    
    if (!userRol) {
      return { error: 'Se requiere información de rol' };
    }
    
    return this.puestosService.cambiarEstado(id, cambiarEstadoDto, userId, userRol);
  }

  // ============ ENDPOINTS PARA OTROS MICROSERVICIOS ============
  // 🔴 Estos serían llamados por el API Gateway u otros microservicios
  
  @Get(':id/verificar-activo')
  verificarPuestoActivo(@Param('id') id: string) {
    return this.puestosService.verificarPuestoActivo(id);
  }

  @Get(':id/verificar-propiedad/:emprendedorId')
  verificarPropiedad(
    @Param('id') id: string,
    @Param('emprendedorId') emprendedorId: string
  ) {
    const esPropietario = this.puestosService.verificarPropiedad(id, emprendedorId);
    return { esPropietario };
  }

  @Get(':id/validar-para-pedido')
  validarPuestoParaPedido(@Param('id') id: string) {
    return this.puestosService.validarPuestoParaPedido(id);
  }
}