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

@Controller('usuarios')// para usar estos endpoinst utiliza la terminacion '/usuarios'
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // nos da el usuario autenticado
  @Get('perfil')
  async obtenerPerfil(@Headers('authorization') authHeader: string) {
    const token = this.extraerToken(authHeader);
    return await this.usuariosService.obtenerUsuarioDesdeToken(token);
  }
  //validamos token
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
  //valida el token y el rol si tiene
  @Get('validar/:rol')
  validarTokenYRol(
    @Headers('authorization') authHeader: string,
    @Param('rol') rol: string
  ) {
    const token = this.extraerToken(authHeader);
    const esValido = this.usuariosService.verificarTokenYRol(token, rol);
    return { valido: esValido };
  }
  //conteo de todos los usuarios por roles
  @Get('estadisticas')
  async getEstadisticas() {
    return await this.usuariosService.contarUsuarios();
  }
  // nos da usuarios por email
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) {
      return { encontrado: false };
    }
    return { encontrado: true, usuario: usuario.getInfoSegura() };
  }
  // nos da todos los usuarios
  @Get()
  async findAll(@Query('rol') rol?: string) {
    if (rol) {
      const rolEnum = this.convertirStringARol(rol);
      return await this.usuariosService.findByRol(rolEnum);
    }
    
    return await this.usuariosService.findAll();
  }
  // obtienes usuarios id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usuariosService.obtenerInfoSegura(id);
  }

  //verifica el rol del usuario
  @Get('verificar/:usuarioId/:rol')
  async verificarUsuarioYRol(
    @Param('usuarioId') usuarioId: string,
    @Param('rol') rol: string
  ) {
    const valido = await this.usuariosService.verificarUsuarioYRol(usuarioId, rol);
    return { valido };
  }

  //registramos el usuario
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() registroDto: RegistroDto) {
    return await this.usuariosService.registrar(registroDto);
  }

  //logeamos al usuario
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.usuariosService.login(loginDto);
  }

  //crear nuevo usuario de diferentes roles
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return await this.usuariosService.create(createUsuarioDto);
  }
  //deslogeamos al usuario
  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
    console.log('Petición de logout recibida');
    const token = this.extraerToken(authHeader);
    const exitoso = this.usuariosService.logout(token);
    return { logout: exitoso };
  }
  //modificamos al usuario
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ) {
    return await this.usuariosService.update(id, updateUsuarioDto);
  }

  //borramos el usuario
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usuariosService.remove(id);
  }

  private convertirStringARol(rolString: string): RolUsuario {
    switch (rolString.toLowerCase()) {
      case 'cliente': return RolUsuario.CLIENTE;
      case 'emprendedor': return RolUsuario.EMPRENDEDOR;
      case 'organizador': return RolUsuario.ORGANIZADOR;
      default: return RolUsuario.CLIENTE;
    }
  }

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
//este .ts se encarga del CRUD de usuarios, login y registro, validaciones basicas