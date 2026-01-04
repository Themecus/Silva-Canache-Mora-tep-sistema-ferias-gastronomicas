import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): any {
    return {
      servicio: 'Sistema de Ferias Gastronómicas - API Gateway',
      version: '1.0.0',
      estado: 'activo',
      microservicios: [
        {
          nombre: 'Usuarios y Autenticación',
          ruta: '/api/usuarios',
          estado: 'activo'
        },
        {
          nombre: 'Puestos Gastronómicos',
          ruta: '/api/puestos',
          estado: 'activo'
        }
      ],
      descripcion: 'Sistema distribuido para gestión de ferias gastronómicas'
    };
  }
}
//contiene la logica de coumentacion