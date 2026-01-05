import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidosRepository: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private detallesRepository: Repository<DetallePedido>,
  ) { }

  async create(createPedidoDto: CreatePedidoDto) {
    const { puestoId, items } = createPedidoDto;

    // TODO: Obtener clienteId del usuario autenticado real.
    const clienteId = 'uuid-cliente-temporal';

    const pedido = new Pedido();
    pedido.clienteId = clienteId;
    pedido.puestoId = puestoId;
    pedido.estado = EstadoPedido.PENDIENTE;
    pedido.detalles = [];

    let totalPedido = 0;

    // Procesar items
    for (const item of items) {
      const detalle = new DetallePedido();
      detalle.productoId = item.productoId;
      detalle.cantidad = item.cantidad;

      // TODO: Consultar precio real al microservicio de productos via RPC/HTTP
      const precioSimulado = 10.0;

      detalle.precioUnitario = precioSimulado;
      detalle.subtotal = precioSimulado * item.cantidad;

      pedido.detalles.push(detalle);
      totalPedido += detalle.subtotal;
    }

    pedido.total = totalPedido;

    return this.pedidosRepository.save(pedido);
  }

  findAll(clienteId?: string, puestoId?: string) {
    const where: any = {};
    if (clienteId) where.clienteId = clienteId;
    if (puestoId) where.puestoId = puestoId;

    return this.pedidosRepository.find({
      where,
      relations: ['detalles'],
    });
  }

  findOne(id: string) {
    return this.pedidosRepository.findOne({
      where: { id },
      relations: ['detalles'],
    });
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto) {
    const pedido = await this.findOne(id);
    if (!pedido) {
      throw new Error('Pedido no encontrado'); // O usar NotFoundException de nestjs
    }
    this.pedidosRepository.merge(pedido, updatePedidoDto);
    return this.pedidosRepository.save(pedido);
  }

  remove(id: string) {
    return `This action removes a #${id} pedido`;
  }
}
