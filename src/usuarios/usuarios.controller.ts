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
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { RolUsuario } from './entities/usuario.entity';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  //Aqui estaran todos los gets
  //nos da el perfil autenticado
  @Get('perfil')
  obtenerPerfil(@Headers('authorization') authHeader: string) {
    const token = this.extraerToken(authHeader);
    return this.usuariosService.obtenerUsuarioDesdeToken(token);
  }
  //valida tokens
  @Get('validar-token')
  validarToken(@Headers('authorization') authHeader: string) {
    const token = this.extraerToken(authHeader);
    const payload = this.usuariosService.validarToken(token);
    
    if (!payload) {
      return { valido: false };
    }
    
    return {
      valido: true,
      usuario: {
        id: payload.sub,
        email: payload.email,
        rol: payload.rol,
        nombre: payload.nombre
      }
    };
  }
  //valida si el token tiene un rol especifico
  @Get('validar/:rol')
  validarTokenYRol(
    @Headers('authorization') authHeader: string,
    @Param('rol') rol: string
  ) {
    const token = this.extraerToken(authHeader);
    const esValido = this.usuariosService.verificarTokenYRol(token, rol);
    return { valido: esValido };
  }
  //nos da estadisticas de usarios
  @Get('estadisticas')
  getEstadisticas() {
    return this.usuariosService.contarUsuarios();
  }
  //busca por email
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    const usuario = this.usuariosService.findByEmail(email);
    if (!usuario) {
      return { encontrado: false };
    }
    return { encontrado: true, usuario: usuario.getInfoSegura() };
  }
  //nos da todos los usuarios y podemos filtrarlo por roles
  @Get()
  findAll(@Query('rol') rol?: string) {
    if (rol) {
      const rolEnum = this.convertirStringARol(rol);
      return this.usuariosService.findByRol(rolEnum);
    }
    
    return this.usuariosService.findAll();
  }
  //por id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.obtenerInfoSegura(id);
  }

  //verifica si un usuario tiene un rol en concreto
  @Get('verificar/:usuarioId/:rol')
  verificarUsuarioYRol(
    @Param('usuarioId') usuarioId: string,
    @Param('rol') rol: string
  ) {
    const valido = this.usuariosService.verificarUsuarioYRol(usuarioId, rol);
    return { valido };
  }
  // aqui los post

  //registra un usuario en el sistema
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  registrar(@Body() registroDto: RegistroDto) {
    return this.usuariosService.registrar(registroDto);
  }
  //logea al usuaario, osea inicia el sistema al usuario
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usuariosService.login(loginDto);
  }

  //creamos un nuevo usuario
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // cerramos sesion para el usuario
  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
  console.log('Peticion de logout recibida');
  const token = this.extraerToken(authHeader);
  const exitoso = this.usuariosService.logout(token);
  return { logout: exitoso };
  }

//el patch

//modificamos al usuario
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

//delete o borrar

//borramos al usuario
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.usuariosService.remove(id);
  }



  // unos metodos complementarios
  //Convierte un string a enum RolUsuario
  private convertirStringARol(rolString: string): RolUsuario {
    switch (rolString.toLowerCase()) {
      case 'cliente': return RolUsuario.CLIENTE;
      case 'emprendedor': return RolUsuario.EMPRENDEDOR;
      case 'organizador': return RolUsuario.ORGANIZADOR;
      default: return RolUsuario.CLIENTE;
    }
  }
  //nos ayuyda a extraer el token del header de autorizacion de postman
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
}

//este .ts controlara la gestion de usarios, ya sea cosas como registros, login/logut
//tambien el tema de los token, CRUD para usairios y consultas