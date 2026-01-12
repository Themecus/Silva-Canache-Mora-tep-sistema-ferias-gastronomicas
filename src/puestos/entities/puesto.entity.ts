import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('puestos')
export class Puesto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 20 })
  color: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pendiente'
  })
  estado: string; // 'pendiente', 'aprobado', 'activo', 'inactivo'

  @Column({ name: 'emprendedor_id' })
  emprendedorId: string;

  @Column({ name: 'aprobado_por_id', nullable: true })
  aprobadoPorId?: string;

  @Column({ default: false })
  disponible: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  // Métodos de instancia
  aprobar(organizadorId: string): void {
    if (this.estado === 'pendiente') {
      this.estado = 'aprobado';
      this.aprobadoPorId = organizadorId;
      this.actualizadoEn = new Date();
    }
  }

  activar(): void {
  
    if (this.estado === 'aprobado' || this.estado === 'inactivo') {
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

  puedeEditar(usuarioId: string): boolean {
    return this.emprendedorId === usuarioId;
  }

  puedeAprobar(rol: string): boolean {
    return rol === 'organizador';
  }
}