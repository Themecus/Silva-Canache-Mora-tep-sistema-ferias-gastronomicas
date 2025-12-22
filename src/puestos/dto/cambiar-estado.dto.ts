// src/puestos/dto/cambiar-estado.dto.ts
export class CambiarEstadoDto {
  estado: string;  // 'aprobado', 'activo', 'inactivo'
  organizadorId?: string;  // Solo para organizadores
}