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

  //aqui extraemos el token
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

  
  @Post()//creamos un nuevo puesto
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPuestoDto: CreatePuestoDto,
    @Headers('authorization') authHeader: string
  ) {
    console.log('Recibida petición para crear puesto');
    const token = this.extraerToken(authHeader);
    return this.puestosService.create(createPuestoDto, token);
  }

  
  @Get()//vemos todos los puestos, podemos filtrarlo por estado tambien
  findAll(@Query('estado') estado?: string) {
    if (estado) {
      return this.puestosService.findByEstado(estado);
    }
    return this.puestosService.findAll();
  }

  @Get('activos')//puesto activos
  findActivos() {
    return this.puestosService.findActivos();
  }

  @Get(':id')//puestos por id
  findOne(@Param('id') id: string) {
    return this.puestosService.findOne(id);
  }

  @Patch(':id')//actualizacion de puestos existentes
  update(
    @Param('id') id: string, 
    @Body() updatePuestoDto: UpdatePuestoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return this.puestosService.update(id, updatePuestoDto, userId);
  }

  @Delete(':id')//borra un puesto
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return this.puestosService.remove(id, userId);
  }

  @Get('emprendedor/:emprendedorId')//obtener todos los puestos de un emprededor en especifico
  findByEmprendedor(@Param('emprendedorId') emprendedorId: string) {
    return this.puestosService.findByEmprendedor(emprendedorId);
  }

  @Patch(':id/estado')//cambiar el estado del puesto
  cambiarEstado(
    @Param('id') id: string, 
    @Body() cambiarEstadoDto: CambiarEstadoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return this.puestosService.cambiarEstado(id, cambiarEstadoDto, userId, userRol);
  }

  
  @Get(':id/verificar-activo')//ver si un puesto esta activo
  verificarPuestoActivo(@Param('id') id: string) {
    return this.puestosService.verificarPuestoActivo(id);
  }

  @Get(':id/verificar-propiedad/:emprendedorId')//verifica si un emprededor es dueno de un puesto
  verificarPropiedad(
    @Param('id') id: string,
    @Param('emprendedorId') emprendedorId: string
  ) {
    const esPropietario = this.puestosService.verificarPropiedad(id, emprendedorId);
    return { esPropietario };
  }

  @Get(':id/validar-para-pedido')//ve si un puesto puede recibir pedidos
  validarPuestoParaPedido(@Param('id') id: string) {
    return this.puestosService.validarPuestoParaPedido(id);
  }
}

//Este .ts almacena todas operaciones CRUD para los puestos
//ya sea eliminarlo, crearlo, buscarlo, actualizarlo y etc