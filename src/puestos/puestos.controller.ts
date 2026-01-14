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

@Controller('puestos')// define los endpoints con relacion a los puestos, usando '/puestos'
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}// se inyecta el servicio de puesto para usar sus cualidades

  private extraerToken(authHeader: string): string {//extra el token
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');//error de no a haberlo
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }
    
    return parts[0];
  }

  @Post()//es post creara un nuevo post
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPuestoDto: CreatePuestoDto,//datos del puesto
    @Headers('authorization') authHeader: string//el token que da autorizacion
  ) {
    console.log('Recibida petición para crear puesto');
    const token = this.extraerToken(authHeader);
    return await this.puestosService.create(createPuestoDto, token);
  }

  @Get()// Nos da todos los puestos creados
  async findAll(@Query('estado') estado?: string) {
    if (estado) {
      return await this.puestosService.findByEstado(estado);
    }
    return await this.puestosService.findAll();
  }

  @Get('activos')// Lo mismo que el anterior, pero solo los activos
  async findActivos() {
    return await this.puestosService.findActivos();
  }

  @Get(':id')// Lo mismo que el anterior, pero solo por ID
  async findOne(@Param('id') id: string) {
    return await this.puestosService.findOne(id);
  }

  @Patch(':id')//modifica el puesto
  async update(
    @Param('id') id: string, 
    @Body() updatePuestoDto: UpdatePuestoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return await this.puestosService.update(id, updatePuestoDto, userId);
  }

  @Delete(':id')// borra el puesto
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return await this.puestosService.remove(id, userId);
  }

  @Get('emprendedor/:emprendedorId')// Lo mismo que el anterior, pero solo el puesto de su emprendedor creador
  async findByEmprendedor(@Param('emprendedorId') emprendedorId: string) {
    return await this.puestosService.findByEmprendedor(emprendedorId);
  }

  @Patch(':id/estado')//modifica el estado del puesto si eres organizador
  async cambiarEstado(
    @Param('id') id: string, 
    @Body() cambiarEstadoDto: CambiarEstadoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    return await this.puestosService.cambiarEstado(id, cambiarEstadoDto, userId, userRol);
  }

  @Get(':id/verificar-activo')//revisar si el puesto esta activado
  async verificarPuestoActivo(@Param('id') id: string) {
    return await this.puestosService.verificarPuestoActivo(id);
  }

  @Get(':id/verificar-propiedad/:emprendedorId')//verificar propiedad
  async verificarPropiedad(
    @Param('id') id: string,//usamos la id del puesto
    @Param('emprendedorId') emprendedorId: string//y el emprendedor
  ) {
    const esPropietario = await this.puestosService.verificarPropiedad(id, emprendedorId);
    return { esPropietario };
  }

  @Get(':id/validar-para-pedido')// revisa si el puesto puede recibir pedidos
  async validarPuestoParaPedido(@Param('id') id: string) {
    return await this.puestosService.validarPuestoParaPedido(id);
  }
}
//este .ts se encarga del CRUD de puestos, cambiar su estados, revisar propiedades de quien a quien, validaciones basicas