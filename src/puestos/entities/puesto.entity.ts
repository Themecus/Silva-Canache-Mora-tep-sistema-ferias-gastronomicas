export class Puesto {
  id: string;
  nombre: string;
  color: string;
  estado: string; 
  emprendedorId: string;// ID del dueno del puesto  
  aprobadoPorId?: string;  // el que aprobo el puesto, osea el organizador
  disponible: boolean;  // si está disponible para el público
  creadoEn: Date;// fecha de creacion
  actualizadoEn: Date;// fecha de actualizacion
  
  //el constructor crea una nueva instancia de Puestos 
  constructor(nombre: string, color: string, emprendedorId: string) {
    this.id = Math.random().toString(36).substring(2);
    this.nombre = nombre;
    this.color = color;
    this.estado = 'pendiente';//siempre lo pondremos en pendiente al inicio
    this.emprendedorId = emprendedorId;
    this.disponible = false;  // solo disponible cuando está activo
    this.creadoEn = new Date();
    this.actualizadoEn = new Date();
  }

  // cacho de codigo actuara para cambiar el estado del puesto, solo pueden los organizadores
  aprobar(organizadorId: string): void {
    if (this.estado === 'pendiente') {
      this.estado = 'aprobado';
      this.aprobadoPorId = organizadorId;
      this.actualizadoEn = new Date();
    }
  }
  // cacho de codigo actuara para cambiar el estado del puesto,solo los organizadores pueden y debe esta previamente aprobado
  activar(): void {
    if (this.estado === 'aprobado') {
      this.estado = 'activo';
      this.disponible = true;
      this.actualizadoEn = new Date();
    }
  }
  // cacho de codigo actuara para cambiar el estado del puesto, solo el dueno y organizador
  inactivar(): void {
    this.estado = 'inactivo';
    this.disponible = false;
    this.actualizadoEn = new Date();
  }

  // el propietario del puesto es el unico a editar
  puedeEditar(usuarioId: string): boolean {
    return this.emprendedorId === usuarioId;
  }

  // Si es un organizador puede activar el puesto
  puedeAprobar(rol: string): boolean {
    return rol === 'organizador';
  }
}