// src/puestos/entities/puesto.entity.ts
export class Puesto {
  id: string;
  nombre: string;
  color: string;
  estado: string;  // 'pendiente', 'aprobado', 'activo', 'inactivo'
  emprendedorId: string;  // 👈 Dueño del puesto
  aprobadoPorId?: string;  // 👈 Quién lo aprobó (organizador)
  disponible: boolean;  // 👈 Si está disponible para el público
  creadoEn: Date;
  actualizadoEn: Date;
  
  constructor(nombre: string, color: string, emprendedorId: string) {
    this.id = Math.random().toString(36).substring(2);
    this.nombre = nombre;
    this.color = color;
    this.estado = 'pendiente';
    this.emprendedorId = emprendedorId;
    this.disponible = false;  // Solo disponible cuando está activo
    this.creadoEn = new Date();
    this.actualizadoEn = new Date();
  }

  // Métodos para cambiar estado
  aprobar(organizadorId: string): void {
    if (this.estado === 'pendiente') {
      this.estado = 'aprobado';
      this.aprobadoPorId = organizadorId;
      this.actualizadoEn = new Date();
    }
  }

  activar(): void {
    if (this.estado === 'aprobado') {
      this.estado = 'activo';
      this.disponible = true;
      this.actualizadoEn = new Date();
    }
  }

  inactivar(): void {
    this.estado = 'inactivo';
    this.disponible = false;
    this.actualizadoEn = new Date();
  }

  // Solo el dueño puede editar
  puedeEditar(usuarioId: string): boolean {
    return this.emprendedorId === usuarioId;
  }

  // Solo organizadores pueden aprobar
  puedeAprobar(rol: string): boolean {
    return rol === 'organizador';
  }
}