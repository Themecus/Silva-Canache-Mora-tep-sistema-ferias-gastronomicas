import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      servicio: 'Microservicio de feria gastronomia',
      version: '1.0.0',
      estado: 'activo',
      endpoints: {
        crear_puesto: 'POST /puestos',
        listar_puestos: 'GET /puestos',
        obtener_puesto: 'GET /puestos/:id',
        actualizar_puesto: 'PATCH /puestos/:id',
        eliminar_puesto: 'DELETE /puestos/:id',
        //aqui se debe agregar otros endpoints
      },
      ejemplo_uso: {
        //ejemplo de uso en postman y esta parte solo lo vera el usuario de postman, podemos mejorar su aspecto
        crear: {
          metodo: 'POST',
          url: '/puestos',
          body: {
            nombre: 'Arepas Rodrigez',
            color: 'rojo',
          },
        },
      },
    };
  }
}
