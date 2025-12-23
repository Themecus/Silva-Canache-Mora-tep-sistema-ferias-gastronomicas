import { Controller, Get } from '@nestjs/common';
//controlador principal de la aplicacion en este puerto
//gran parte de la info aqui es para saber que hace cada endpoint, aunque algunos seran quitados cuando unamos microservicios
@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      servicio: 'Microservicio de Puestos Gastronómicos',
      version: '2.0.0',
      estado: 'activo',
      descripcion: 'Gestión completa de puestos con estados y validaciones',
      endpoints_publicos: {
        raiz: 'GET /',
        puestos_activos: 'GET /puestos/activos',
        verificar_puesto: 'GET /puestos/:id/verificar-activo'
      },
      endpoints_autenticados: {
        //  ojo: Estos endpoints requerirán JWT validado por API Gateway
        crear_puesto: 'POST /puestos (Header: x-user-id, x-user-rol=emprendedor)',
        mis_puestos: 'GET /puestos/emprendedor/:id',
        editar_puesto: 'PATCH /puestos/:id (solo dueño)',
        eliminar_puesto: 'DELETE /puestos/:id (solo dueño, solo pendientes)',
        cambiar_estado: 'PATCH /puestos/:id/estado (aprobado: organizadores, activo: organizadores, inactivo: dueño/organizadores)'
      },
      flujo_estados: {
        pendiente: '→ (organizador) → aprobado → (organizador) → activo',
        'cualquier estado': '→ (dueño/organizador) → inactivo'
      },
      ejemplo_simulacion_postman: {
        crear_puesto: {
          metodo: 'POST',
          url: '/puestos',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'emp-123',         
            'x-user-rol': 'emprendedor'      
          },
          body: {
            nombre: 'Tacos El Güero',
            color: 'rojo'
          }
        },
        aprobar_puesto: {
          metodo: 'PATCH',
          url: '/puestos/{id}/estado',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'org-456',          
            'x-user-rol': 'organizador'     
          },
          body: {
            estado: 'aprobado'
          }
        }
      }
    };
  }
}