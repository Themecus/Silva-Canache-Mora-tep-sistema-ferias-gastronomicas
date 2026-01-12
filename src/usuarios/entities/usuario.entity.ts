import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RolUsuario {
  CLIENTE = 'cliente',
  EMPRENDEDOR = 'emprendedor',
  ORGANIZADOR = 'organizador'
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 50 })
  nombre: string;

  @Column({ length: 50 })
  apellido: string;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.CLIENTE
  })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  // Métodos de instancia (sin cambios)
  puedeCrearPuesto(): boolean {
    return this.rol === RolUsuario.EMPRENDEDOR;
  }

  puedeAprobarPuestos(): boolean {
    return this.rol === RolUsuario.ORGANIZADOR;
  }

  esCliente(): boolean {
    return this.rol === RolUsuario.CLIENTE;
  }

  getNombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

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