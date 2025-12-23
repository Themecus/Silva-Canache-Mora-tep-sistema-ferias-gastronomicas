import { //los diferentes comandos para el postman
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

//se encarga de manejar las rutas HTTP
@Controller('puestos')
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}

  // el CRUD 
  // crear un nuevo puesto
  @Post()
  @HttpCode(HttpStatus.CREATED)//deberia devolver el codigo 201 en caso de ser creado
  create(
    @Body() createPuestoDto: CreatePuestoDto,
    @Headers('x-user-id') userId: string,  // tanto este 
    @Headers('x-user-rol') userRol: string  // como este son temporales, nesecitamos implementar el microservicio 1
  ) {
    // Nota: Este header vendría del API Gateway después de validar JWT y Verificar con microservicio 1 que el usuario existe y es emprendedor
    
    if (!userId) {//verficadores
      return { error: 'Se requiere autenticación' };
    }
    
    if (userRol !== 'emprendedor') {//verficadores
      return { error: 'Solo emprendedores pueden crear puestos' };
    }
    
    // Forzar que el emprendedorId sea el usuario autenticado
    createPuestoDto.emprendedorId = userId;
    
    return this.puestosService.create(createPuestoDto);
  }

  //nos da todos lo puestos
  @Get()
  findAll(@Query('estado') estado?: string) {
    if (estado) {
      return this.puestosService.findByEstado(estado);
    }
    return this.puestosService.findAll();
  }
  //nos da los puestos activos
  @Get('activos')
  findActivos() {
    return this.puestosService.findActivos();
  }
  //nos da los puestos por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puestosService.findOne(id);
  }
  //actualiza los puestos pero solo puede el dueno
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updatePuestoDto: UpdatePuestoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    //Nota: Validación real con microservicio 1
    if (!userId) {
      return { error: 'Se requiere autenticación' };
    }
    
    return this.puestosService.update(id, updatePuestoDto, userId);
  }
  //borra el puesto si eres el dueno y lo tienes en pendiente
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    //Nota: Validación real con microservicio 1
    if (!userId) {
      return { error: 'Se requiere autenticación' };
    }
    
    return this.puestosService.remove(id, userId);
  }

  //  ENDPOINTS ESPECÍFICOS 
  //verifica si esta activo para otros microservicios
  @Get('emprendedor/:emprendedorId')
  findByEmprendedor(@Param('emprendedorId') emprendedorId: string) {
    return this.puestosService.findByEmprendedor(emprendedorId);
  }
  //cambia el estado del puesto
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string, 
    @Body() cambiarEstadoDto: CambiarEstadoDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-rol') userRol: string
  ) {
    //Nota: Validación real con microservicio 1
    if (!userId) {
      return { error: 'Se requiere autenticación' };
    }
    
    if (!userRol) {
      return { error: 'Se requiere información de rol' };
    }
    
    return this.puestosService.cambiarEstado(id, cambiarEstadoDto, userId, userRol);
  }

  //  ENDPOINTS PARA OTROS MICROSERVICIOS 
  // Nota: Estos serían llamados por el API Gateway u otros microservicios
 
  //verifica si un puesto está activo (para otros microservicios)
  @Get(':id/verificar-activo')
  verificarPuestoActivo(@Param('id') id: string) {
    return this.puestosService.verificarPuestoActivo(id);
  }
  //verifica si un emprendedor es dueño de un puesto (para otros microservicios)
  @Get(':id/verificar-propiedad/:emprendedorId')
  verificarPropiedad(
    @Param('id') id: string,
    @Param('emprendedorId') emprendedorId: string
  ) {
    const esPropietario = this.puestosService.verificarPropiedad(id, emprendedorId);
    return { esPropietario };
  }
  //verificar para un pedido
  @Get(':id/validar-para-pedido')
  validarPuestoParaPedido(@Param('id') id: string) {
    return this.puestosService.validarPuestoParaPedido(id);
  }
}