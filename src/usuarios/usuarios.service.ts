import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario, RolUsuario } from './entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';

// iterface para el tema de los token 
interface TokenPayload {
  sub: string;
  email: string;
  rol: string;
  nombre: string;
  exp: number;
}

@Injectable()
export class UsuariosService {
  private usuarios: Usuario[] = [];
  private tokens: Map<string, TokenPayload> = new Map();

  private usuariosPorDefecto = [
    new Usuario('admin@feria.com', 'admin123', 'Admin', 'Sistema', RolUsuario.ORGANIZADOR, '3001234567'),
    new Usuario('cliente@ejemplo.com', 'cliente123', 'Carlos', 'Lopez', RolUsuario.CLIENTE, '3007654321'),
    new Usuario('emprendedor@ejemplo.com', 'emprendedor123', 'Maria', 'Gomez', RolUsuario.EMPRENDEDOR, '3001122334')
  ];

  constructor() {
    this.usuarios.push(...this.usuariosPorDefecto);
    console.log('Usuarios por defecto cargados:', this.usuarios.length);
  }

  // aqui abra un CRUD basico

  create(createUsuarioDto: CreateUsuarioDto): Usuario {
    const usuarioExistente = this.usuarios.find(u => u.email === createUsuarioDto.email);
    if (usuarioExistente) {
      throw new BadRequestException('El email ya esta registrado');
    }

    const rolesValidos = ['cliente', 'emprendedor', 'organizador'];
    if (!rolesValidos.includes(createUsuarioDto.rol)) {
      throw new BadRequestException(`Rol no valido. Use: ${rolesValidos.join(', ')}`);
    }

    let rolEnum: RolUsuario;
    switch (createUsuarioDto.rol) {
      case 'cliente': rolEnum = RolUsuario.CLIENTE; break;
      case 'emprendedor': rolEnum = RolUsuario.EMPRENDEDOR; break;
      case 'organizador': rolEnum = RolUsuario.ORGANIZADOR; break;
      default: rolEnum = RolUsuario.CLIENTE;
    }

    const usuario = new Usuario(
      createUsuarioDto.email,
      createUsuarioDto.password,
      createUsuarioDto.nombre,
      createUsuarioDto.apellido,
      rolEnum,
      createUsuarioDto.telefono
    );

    this.usuarios.push(usuario);
    return usuario;
  }

  findAll(): Usuario[] {
    return this.usuarios;
  }

  findOne(id: string): Usuario {
    const usuario = this.usuarios.find(u => u.id === id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  findByEmail(email: string): Usuario | undefined {
    return this.usuarios.find(u => u.email === email);
  }

  update(id: string, updateUsuarioDto: UpdateUsuarioDto): Usuario {
    const usuario = this.findOne(id);
    
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const emailExistente = this.usuarios.find(u => u.email === updateUsuarioDto.email && u.id !== id);
      if (emailExistente) {
        throw new BadRequestException('El email ya esta en uso por otro usuario');
      }
      usuario.email = updateUsuarioDto.email;
    }

    if (updateUsuarioDto.password) usuario.password = updateUsuarioDto.password;
    if (updateUsuarioDto.nombre) usuario.nombre = updateUsuarioDto.nombre;
    if (updateUsuarioDto.apellido) usuario.apellido = updateUsuarioDto.apellido;
    if (updateUsuarioDto.telefono !== undefined) usuario.telefono = updateUsuarioDto.telefono;
    if (updateUsuarioDto.activo !== undefined) usuario.activo = updateUsuarioDto.activo;

    usuario.actualizadoEn = new Date();
    return usuario;
  }

  remove(id: string): Usuario {
    const usuario = this.findOne(id);
    usuario.activo = false;
    usuario.actualizadoEn = new Date();
    return usuario;
  }

  // de aqui el apartado de autenticacion

  registrar(registroDto: RegistroDto) {
    // aprovechamos el metodo create ya existente
    const usuario = this.create({
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

  login(loginDto: LoginDto) {
    const usuario = this.validarCredenciales(loginDto.email, loginDto.password);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales invalidas');
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

  validarCredenciales(email: string, password: string): Usuario | null {
    const usuario = this.findByEmail(email);
    
    if (!usuario || !usuario.activo) {
      return null;
    }
    
    if (usuario.password === password) {
      return usuario;
    }
    return null;
  }

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

  obtenerUsuarioDesdeToken(token: string) {
    const payload = this.validarToken(token);
    
    if (!payload) {
      throw new UnauthorizedException('Token invalido o expirado');
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

  // funciones extras

  verificarUsuarioYRol(usuarioId: string, rolEsperado: string): boolean {
    try {
      const usuario = this.findOne(usuarioId);
      return usuario.rol === rolEsperado && usuario.activo === true;
    } catch {
      return false;
    }
  }

  obtenerInfoSegura(usuarioId: string) {
    const usuario = this.findOne(usuarioId);
    return usuario.getInfoSegura();
  }

  findByRol(rol: RolUsuario): Usuario[] {
    return this.usuarios.filter(u => u.rol === rol && u.activo);
  }

  contarUsuarios(): { total: number; porRol: Record<string, number> } {
    const porRol: Record<string, number> = {};
    
    this.usuarios.forEach(usuario => {
      const rol = usuario.rol;
      porRol[rol] = (porRol[rol] || 0) + 1;
    });

    return {
      total: this.usuarios.length,
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