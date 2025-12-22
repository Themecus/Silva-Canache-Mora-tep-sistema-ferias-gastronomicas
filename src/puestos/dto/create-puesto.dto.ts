// src/puestos/dto/create-puesto.dto.ts
export class CreatePuestoDto {
  nombre: string;
  color: string;
  emprendedorId: string;  // 👈 NUEVO: ID del emprendedor que crea
}