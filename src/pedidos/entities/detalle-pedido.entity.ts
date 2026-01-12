import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pedido } from './pedido.entity';

@Entity()
export class DetallePedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productoId: string; // Referencia al microservicio de productos

  @Column('int')
  cantidad: number;

  @Column('decimal')
  precioUnitario: number;

  @Column('decimal')
  subtotal: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles)
  pedido: Pedido;
}
