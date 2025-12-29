// src/usuarios/entities/usuario.entity.ts

/**
 * Roles disponibles en el sistema
 */
export enum RolUsuario {
  CLIENTE = 'cliente',
  EMPRENDEDOR = 'emprendedor',
  ORGANIZADOR = 'organizador'
}

/**
 * Entidad que representa un usuario en el sistema
 * Contiene todos los datos de un usuario
 */
export class Usuario {
  id: string;           // Identificador único
  email: string;        // Correo electrónico (único)
  password: string;     // Contraseña (debería estar encriptada)
  nombre: string;       // Nombre del usuario
  apellido: string;     // Apellido del usuario
  telefono?: string;    // Teléfono opcional
  rol: RolUsuario;      // Rol: cliente, emprendedor, organizador
  activo: boolean;      // Si el usuario está activo/inactivo
  creadoEn: Date;       // Fecha de creación
  actualizadoEn: Date;  // Fecha de última actualización

  /**
   * Constructor para crear un nuevo usuario
   */
  constructor(
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    rol: RolUsuario,
    telefono?: string
  ) {
    this.id = this.generarId();
    this.email = email;
    this.password = password;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.rol = rol;
    this.activo = true; // Por defecto activo
    this.creadoEn = new Date();
    this.actualizadoEn = new Date();
  }

  /**
   * Genera un ID único para el usuario
   */
  private generarId(): string {
    return 'usr-' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Verifica si el usuario puede crear puestos
   * Solo emprendedores pueden crear puestos
   */
  puedeCrearPuesto(): boolean {
    return this.rol === RolUsuario.EMPRENDEDOR;
  }

  /**
   * Verifica si el usuario puede aprobar puestos
   * Solo organizadores pueden aprobar puestos
   */
  puedeAprobarPuestos(): boolean {
    return this.rol === RolUsuario.ORGANIZADOR;
  }

  /**
   * Verifica si el usuario es cliente
   */
  esCliente(): boolean {
    return this.rol === RolUsuario.CLIENTE;
  }

  /**
   * Devuelve el nombre completo del usuario
   */
  getNombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  /**
   * Devuelve información segura del usuario (sin password)
   */
  getInfoSegura() {
    return {
      id: this.id,
      email: this.email,
      nombre: this.nombre,
      apellido: this.apellido,
      telefono: this.telefono,
      rol: this.rol,
      activo: this.activo,
      creadoEn: this.creadoEn,
      actualizadoEn: this.actualizadoEn,
      nombreCompleto: this.getNombreCompleto()
    };
  }
}