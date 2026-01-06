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

  // Añade async y await a los métodos que llaman servicios asíncronos

  @Get('perfil')
  async obtenerPerfil(@Headers('authorization') authHeader: string) {
    const token = this.extraerToken(authHeader);
    return await this.usuariosService.obtenerUsuarioDesdeToken(token);
  }

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

  @Get('validar/:rol')
  validarTokenYRol(
    @Headers('authorization') authHeader: string,
    @Param('rol') rol: string
  ) {
    const token = this.extraerToken(authHeader);
    const esValido = this.usuariosService.verificarTokenYRol(token, rol);
    return { valido: esValido };
  }

  @Get('estadisticas')
  async getEstadisticas() {
    return await this.usuariosService.contarUsuarios();
  }

  // CORREGIDO: Añadido async/await
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) {
      return { encontrado: false };
    }
    return { encontrado: true, usuario: usuario.getInfoSegura() };
  }

  @Get()
  async findAll(@Query('rol') rol?: string) {
    if (rol) {
      const rolEnum = this.convertirStringARol(rol);
      return await this.usuariosService.findByRol(rolEnum);
    }
    
    return await this.usuariosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usuariosService.obtenerInfoSegura(id);
  }

  @Get('verificar/:usuarioId/:rol')
  async verificarUsuarioYRol(
    @Param('usuarioId') usuarioId: string,
    @Param('rol') rol: string
  ) {
    const valido = await this.usuariosService.verificarUsuarioYRol(usuarioId, rol);
    return { valido };
  }

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() registroDto: RegistroDto) {
    return await this.usuariosService.registrar(registroDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.usuariosService.login(loginDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return await this.usuariosService.create(createUsuarioDto);
  }

  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
    console.log('Petición de logout recibida');
    const token = this.extraerToken(authHeader);
    const exitoso = this.usuariosService.logout(token);
    return { logout: exitoso };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ) {
    return await this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usuariosService.remove(id);
  }

  // Métodos auxiliares (sin cambios)
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