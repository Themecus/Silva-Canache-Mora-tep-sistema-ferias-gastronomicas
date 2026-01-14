import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  // Método para extraer token
  private extraerToken(authHeader: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const parts = authHeader.split(' ');

    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }

    return parts[0];
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPedidoDto: CreatePedidoDto,
    @Headers('authorization') authHeader: string,
  ) {
    const token = this.extraerToken(authHeader);
    return this.pedidosService.create(createPedidoDto, token);
  }

  @Get()
  findAll(
    @Query('clienteId') clienteId?: string,
    @Query('puestoId') puestoId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const token = authHeader ? this.extraerToken(authHeader) : undefined;
    return this.pedidosService.findAll(clienteId, puestoId, token);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePedidoDto: UpdatePedidoDto,
    @Headers('authorization') authHeader?: string,
  ) {
    const token = authHeader ? this.extraerToken(authHeader) : undefined;
    return this.pedidosService.update(id, updatePedidoDto, token);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const token = authHeader ? this.extraerToken(authHeader) : undefined;
    return this.pedidosService.remove(id, token);
  }
}
