import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { DetallePedido } from './detalle-pedido.entity';

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  PREPARANDO = 'PREPARANDO',
  LISTO = 'LISTO',
  ENTREGADO = 'ENTREGADO',
}

@Entity()
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clienteId: string; // Referencia al usuario

  @Column()
  puestoId: string; // Referencia al puesto

  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @CreateDateColumn()
  fecha: Date;

  @Column('decimal', { default: 0 })
  total: number;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, {
    cascade: true,
  })
  detalles: DetallePedido[];
}
