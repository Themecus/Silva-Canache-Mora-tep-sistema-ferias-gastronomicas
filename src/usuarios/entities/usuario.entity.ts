export enum RolUsuario {
  CLIENTE = 'cliente',
  EMPRENDEDOR = 'emprendedor',
  ORGANIZADOR = 'organizador'
}


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

  //da un ID unico al usuario
  private generarId(): string {
    return 'usr-' + Math.random().toString(36).substring(2, 9);
  }

  //verifica si el usuario tiene permisos para crear el puesto
  puedeCrearPuesto(): boolean {
    return this.rol === RolUsuario.EMPRENDEDOR;
  }
  //verifica si el usuario tiene permisos de aprobacion de puestos
  puedeAprobarPuestos(): boolean {
    return this.rol === RolUsuario.ORGANIZADOR;
  }

  //revisa si es cliente
  esCliente(): boolean {
    return this.rol === RolUsuario.CLIENTE;
  }

  //nombre del usuario
  getNombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  //da datos de usuario pero sin contrasena
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

//este .ts se encarga de definir los dato sy comportamientos del usuario