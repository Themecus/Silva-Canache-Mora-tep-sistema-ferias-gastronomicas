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
  HttpStatus,
  UnauthorizedException 
} from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@Controller('puestos')
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}

  // ============ MÉTODO PARA EXTRAER TOKEN ============
  
  private extraerToken(authHeader: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }
    
    return parts[0];
  }

  // ============ ENDPOINT CREATE CON TOKEN REAL ============
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPuestoDto: CreatePuestoDto,
    @Headers('authorization') authHeader: string
  ) {
    console.log('Recibida petición para crear puesto');
    const token = this.extraerToken(authHeader);
    return this.puestosService.create(createPuestoDto, token);
  }

  // ============ ENDPOINTS QUE SIGUEN USANDO HEADERS SIMULADOS ============
  
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
    return this.puestosService.update(id, updatePuestoDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return this.puestosService.remove(id, userId);
  }

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
    return this.puestosService.cambiarEstado(id, cambiarEstadoDto, userId, userRol);
  }

  // ============ ENDPOINTS PARA OTROS MICROSERVICIOS ============
  
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