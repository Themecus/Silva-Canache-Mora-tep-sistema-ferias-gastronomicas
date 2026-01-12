import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario, RolUsuario } from './entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import * as bcrypt from 'bcrypt';

interface TokenPayload {
  sub: string;
  email: string;
  rol: string;
  nombre: string;
  exp: number;
}

@Injectable()
export class UsuariosService {
  private tokens: Map<string, TokenPayload> = new Map();

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {
    this.cargarUsuariosPorDefecto();
  }

  private async cargarUsuariosPorDefecto() {
    const count = await this.usuarioRepository.count();
    
    if (count === 0) {
      const usuariosPorDefecto = [
        this.usuarioRepository.create({
          email: 'admin@feria.com',
          password: await bcrypt.hash('admin123', 10),
          nombre: 'Admin',
          apellido: 'Sistema',
          rol: RolUsuario.ORGANIZADOR,
          telefono: '3001234567',
        }),
        this.usuarioRepository.create({
          email: 'cliente@ejemplo.com',
          password: await bcrypt.hash('cliente123', 10),
          nombre: 'Carlos',
          apellido: 'Lopez',
          rol: RolUsuario.CLIENTE,
          telefono: '3007654321',
        }),
        this.usuarioRepository.create({
          email: 'emprendedor@ejemplo.com',
          password: await bcrypt.hash('emprendedor123', 10),
          nombre: 'Maria',
          apellido: 'Gomez',
          rol: RolUsuario.EMPRENDEDOR,
          telefono: '3001122334',
        }),
      ];

      await this.usuarioRepository.save(usuariosPorDefecto);
      console.log('Usuarios por defecto cargados');
    }
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email }
    });
    
    if (usuarioExistente) {
      throw new BadRequestException('El email ya está registrado');
    }

    const rolesValidos = ['cliente', 'emprendedor', 'organizador'];
    if (!rolesValidos.includes(createUsuarioDto.rol)) {
      throw new BadRequestException(`Rol no válido. Use: ${rolesValidos.join(', ')}`);
    }

    let rolEnum: RolUsuario;
    switch (createUsuarioDto.rol) {
      case 'cliente': rolEnum = RolUsuario.CLIENTE; break;
      case 'emprendedor': rolEnum = RolUsuario.EMPRENDEDOR; break;
      case 'organizador': rolEnum = RolUsuario.ORGANIZADOR; break;
      default: rolEnum = RolUsuario.CLIENTE;
    }

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: await bcrypt.hash(createUsuarioDto.password, 10),
      rol: rolEnum,
    });

    return await this.usuarioRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find({ where: { activo: true } });
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const emailExistente = await this.usuarioRepository.findOne({
        where: { email: updateUsuarioDto.email }
      });
      
      if (emailExistente && emailExistente.id !== id) {
        throw new BadRequestException('El email ya está en uso por otro usuario');
      }
      
      usuario.email = updateUsuarioDto.email;
    }

    if (updateUsuarioDto.password) {
      usuario.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }
    
    if (updateUsuarioDto.nombre) usuario.nombre = updateUsuarioDto.nombre;
    if (updateUsuarioDto.apellido) usuario.apellido = updateUsuarioDto.apellido;
    if (updateUsuarioDto.telefono !== undefined) usuario.telefono = updateUsuarioDto.telefono;
    if (updateUsuarioDto.activo !== undefined) usuario.activo = updateUsuarioDto.activo;

    return await this.usuarioRepository.save(usuario);
  }

  async remove(id: string): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.activo = false;
    return await this.usuarioRepository.save(usuario);
  }

  async registrar(registroDto: RegistroDto) {
    const usuario = await this.create({
      email: registroDto.email,
      password: registroDto.password,
      nombre: registroDto.nombre,
      apellido: registroDto.apellido,
      rol: registroDto.rol,
      telefono: registroDto.telefono
    });

    const token = this.generarToken(usuario);
    
    return {
      usuario: this.omitirPassword(usuario),
      token
    };
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.validarCredenciales(loginDto.email, loginDto.password);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const token = this.generarToken(usuario);
    
    return {
      usuario: this.omitirPassword(usuario),
      token
    };
  }

  async validarCredenciales(email: string, password: string): Promise<Usuario | null> {
    const usuario = await this.findByEmail(email);
    
    if (!usuario || !usuario.activo) {
      return null;
    }
    
    const esPasswordValido = await bcrypt.compare(password, usuario.password);
    
    if (esPasswordValido) {
      return usuario;
    }
    
    return null;
  }

  // Los métodos de token y demás siguen igual...
  validarToken(token: string): TokenPayload | null {
    const payload = this.tokens.get(token);
    
    if (!payload) {
      return null;
    }

    if (payload.exp < Date.now()) {
      this.tokens.delete(token);
      return null;
    }

    return payload;
  }

  async obtenerUsuarioDesdeToken(token: string) {
    const payload = this.validarToken(token);
    
    if (!payload) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    
    return this.obtenerInfoSegura(payload.sub);
  }

  logout(token: string): boolean {
    return this.tokens.delete(token);
  }

  verificarTokenYRol(token: string, rolEsperado: string): boolean {
    const payload = this.validarToken(token);
    
    if (!payload) {
      return false;
    }
    
    return payload.rol === rolEsperado;
  }

  obtenerUserIdDesdeToken(token: string): string | null {
    const payload = this.validarToken(token);
    return payload ? payload.sub : null;
  }

  async verificarUsuarioYRol(usuarioId: string, rolEsperado: string): Promise<boolean> {
    try {
      const usuario = await this.findOne(usuarioId);
      return usuario.rol === rolEsperado && usuario.activo === true;
    } catch {
      return false;
    }
  }

  async obtenerInfoSegura(usuarioId: string) {
    const usuario = await this.findOne(usuarioId);
    return usuario.getInfoSegura();
  }

  async findByRol(rol: RolUsuario): Promise<Usuario[]> {
    return await this.usuarioRepository.find({ 
      where: { rol, activo: true } 
    });
  }

  async contarUsuarios(): Promise<{ total: number; porRol: Record<string, number> }> {
    const usuarios = await this.usuarioRepository.find();
    
    const porRol: Record<string, number> = {};
    
    usuarios.forEach(usuario => {
      const rol = usuario.rol;
      porRol[rol] = (porRol[rol] || 0) + 1;
    });

    return {
      total: usuarios.length,
      porRol
    };
  }

  private generarToken(usuario: Usuario): string {
    const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    const payload: TokenPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: `${usuario.nombre} ${usuario.apellido}`,
      exp: Date.now() + (24 * 60 * 60 * 1000)
    };
    
    this.tokens.set(token, payload);
    
    return token;
  }

  private omitirPassword(usuario: Usuario) {
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }
}