import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { CustomHttpService } from '../common/http/http.service'; // Importar servicio HTTP

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidosRepository: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private detallesRepository: Repository<DetallePedido>,
    private readonly httpService: CustomHttpService, // Inyectar HTTP service
  ) {}

  async create(createPedidoDto: CreatePedidoDto, token: string) {
    // 1. VALIDAR TOKEN Y OBTENER CLIENTE REAL
    let usuario;
    try {
      usuario = await this.httpService.validarYExtraerUsuario(token);
    } catch (error) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Solo clientes pueden crear pedidos
    if (usuario.rol !== 'cliente') {
      throw new BadRequestException('Solo los clientes pueden crear pedidos');
    }

    const { puestoId, items } = createPedidoDto;

    // 2. VERIFICAR QUE EL PUESTO EXISTA Y ESTÉ ACTIVO
    const puestoValido =
      await this.httpService.validarPuestoParaPedido(puestoId);

    if (!puestoValido.valido) {
      throw new BadRequestException(
        `Puesto no disponible: ${puestoValido.motivo}`,
      );
    }

    // 3. CREAR PEDIDO CON CLIENTE REAL
    const pedido = new Pedido();
    pedido.clienteId = usuario.id; // ← CLIENTE REAL, NO FIJO
    pedido.puestoId = puestoId;
    pedido.estado = EstadoPedido.PENDIENTE;
    pedido.detalles = [];

    let totalPedido = 0;

    // 4. PROCESAR ITEMS (TEMPORAL: PRECIOS SIMULADOS)
    // TODO: Integrar con microservicio de productos
    for (const item of items) {
      const detalle = new DetallePedido();
      detalle.productoId = item.productoId;
      detalle.cantidad = item.cantidad;

      // TEMPORAL: Precio simulado - Reemplazar con llamado a microservicio de productos
      const precioSimulado = await this.obtenerPrecioProducto(item.productoId);

      detalle.precioUnitario = precioSimulado;
      detalle.subtotal = precioSimulado * item.cantidad;

      pedido.detalles.push(detalle);
      totalPedido += detalle.subtotal;
    }

    pedido.total = totalPedido;

    return await this.pedidosRepository.save(pedido);
  }

  async findAll(clienteId?: string, puestoId?: string, token?: string) {
    const where: any = {};

    // Si hay token, validarlo y filtrar por cliente
    if (token) {
      try {
        const usuario = await this.httpService.validarYExtraerUsuario(token);

        // Si es cliente, solo puede ver sus pedidos
        if (usuario.rol === 'cliente') {
          where.clienteId = usuario.id;
        }
        // Si es emprendedor, solo puede ver pedidos de sus puestos
        else if (usuario.rol === 'emprendedor') {
          // Obtener puestos del emprendedor
          const puestosEmprendedor = await this.obtenerPuestosEmprendedor(
            usuario.id,
          );
          if (puestosEmprendedor.length > 0) {
            where.puestoId = puestosEmprendedor.map((p) => p.id);
          } else {
            return []; // No tiene puestos, no puede ver pedidos
          }
        }
        // Organizador ve todos (no filtra)
      } catch (error) {
        // Token inválido, no filtra
      }
    }

    // Filtros manuales (sobreescriben si se especifican)
    if (clienteId) where.clienteId = clienteId;
    if (puestoId) where.puestoId = puestoId;

    return this.pedidosRepository.find({
      where,
      relations: ['detalles'],
      order: { fecha: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.pedidosRepository.findOne({
      where: { id },
      relations: ['detalles'],
    });
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto, token?: string) {
    const pedido = await this.findOne(id);

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Validar permisos si hay token
    if (token) {
      const usuario = await this.httpService.validarYExtraerUsuario(token);

      // Solo el dueño del puesto puede actualizar pedidos de ese puesto
      const esDueñoPuesto = await this.verificarPropiedadPuesto(
        pedido.puestoId,
        usuario.id,
      );

      if (!esDueñoPuesto && usuario.rol !== 'organizador') {
        throw new BadRequestException(
          'No tienes permisos para actualizar este pedido',
        );
      }
    }

    this.pedidosRepository.merge(pedido, updatePedidoDto);
    return this.pedidosRepository.save(pedido);
  }

  async remove(id: string, token?: string) {
    const pedido = await this.findOne(id);

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Validar permisos si hay token
    if (token) {
      const usuario = await this.httpService.validarYExtraerUsuario(token);

      // Solo el cliente que creó el pedido puede eliminarlo (si está pendiente)
      if (usuario.id !== pedido.clienteId) {
        throw new BadRequestException(
          'Solo el cliente puede eliminar su pedido',
        );
      }

      if (pedido.estado !== EstadoPedido.PENDIENTE) {
        throw new BadRequestException(
          'Solo se pueden eliminar pedidos pendientes',
        );
      }
    }

    await this.pedidosRepository.remove(pedido);
    return { mensaje: 'Pedido eliminado correctamente' };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private async obtenerPrecioProducto(productoId: string): Promise<number> {
    // TEMPORAL: Precios simulados por tipo de producto
    // TODO: Reemplazar con llamado HTTP a microservicio de productos
    const preciosSimulados: Record<string, number> = {
      hamburguesa: 15.99,
      pizza: 12.5,
      ensalada: 8.75,
      refresco: 3.5,
      agua: 1.5,
      cafe: 2.25,
      postre: 6.0,
      'papas-fritas': 4.5,
    };

    return preciosSimulados[productoId] || 10.0; // Default $10
  }

  private async obtenerPuestosEmprendedor(
    emprendedorId: string,
  ): Promise<Array<{ id: string }>> {
    // TEMPORAL: Simular llamada HTTP
    // TODO: Reemplazar con llamado real a servicio de puestos
    return [{ id: 'puesto-simulado' }];
  }

  private async verificarPropiedadPuesto(
    puestoId: string,
    usuarioId: string,
  ): Promise<boolean> {
    // TEMPORAL: Simular verificación
    // TODO: Reemplazar con llamado real
    return false;
  }
}
