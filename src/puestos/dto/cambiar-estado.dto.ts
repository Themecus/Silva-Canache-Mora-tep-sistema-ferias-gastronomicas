export class CambiarEstadoDto {
  estado: string; // aqui guardaremos los estados que se encuentran los puestos, como lo seria 'aprobado', 'activo', 'inactivo'
  organizadorId?: string; // guardaremos la info de los organizadores si existen
}

//este archivo es para organizar los estados que se encuentren los puestos