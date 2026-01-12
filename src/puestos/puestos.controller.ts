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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPuestoDto: CreatePuestoDto,
    @Headers('authorization') authHeader: string
  ) {
    console.log('Recibida petición para crear puesto');
    const token = this.extraerToken(authHeader);
    return await this.puestosService.create(createPuestoDto, token);
  }

  @Get()
  async findAll(@Query('estado') estado?: string) {
    if (estado) {
      return await this.puestosService.findByEstado(estado);
    }
    return await this.puestosService.findAll();
  }

  @Get('activos')
  async findActivos() {
    return await this.puestosService.findActivos();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.puestosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updatePuestoDto: UpdatePuestoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return await this.puestosService.update(id, updatePuestoDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return await this.puestosService.remove(id, userId);
  }

  @Get('emprendedor/:emprendedorId')
  async findByEmprendedor(@Param('emprendedorId') emprendedorId: string) {
    return await this.puestosService.findByEmprendedor(emprendedorId);
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: string, 
    @Body() cambiarEstadoDto: CambiarEstadoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return await this.puestosService.cambiarEstado(id, cambiarEstadoDto, userId, userRol);
  }

  @Get(':id/verificar-activo')
  async verificarPuestoActivo(@Param('id') id: string) {
    return await this.puestosService.verificarPuestoActivo(id);
  }

  @Get(':id/verificar-propiedad/:emprendedorId')
  async verificarPropiedad(
    @Param('id') id: string,
    @Param('emprendedorId') emprendedorId: string
  ) {
    const esPropietario = await this.puestosService.verificarPropiedad(id, emprendedorId);
    return { esPropietario };
  }

  @Get(':id/validar-para-pedido')
  async validarPuestoParaPedido(@Param('id') id: string) {
    return await this.puestosService.validarPuestoParaPedido(id);
  }
}