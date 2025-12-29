import { Controller, Get } from '@nestjs/common';
      servicio: 'Microservicio de Usuarios y Autenticacion',
      version: '1.0.0',
      estado: 'activo',
      descripcion: 'Gestion de usuarios con autenticacion integrada',
      
      endpoints: {
        // Autenticacion
        registro: 'POST /usuarios/registro',
        login: 'POST /usuarios/login',
        perfil: 'GET /usuarios/perfil (requiere token)',
        logout: 'POST /usuarios/logout',
        validar_token: 'GET /usuarios/validar-token',
        validar_token_rol: 'GET /usuarios/validar/{rol}',
        
        // Gestion de usuarios
        crear_usuario: 'POST /usuarios',
        listar_usuarios: 'GET /usuarios',
        listar_por_rol: 'GET /usuarios?rol=cliente|emprendedor|organizador',
        obtener_usuario: 'GET /usuarios/:id',
        buscar_por_email: 'GET /usuarios/email/:email',
        actualizar_usuario: 'PATCH /usuarios/:id',
        desactivar_usuario: 'DELETE /usuarios/:id',
        estadisticas: 'GET /usuarios/estadisticas',
        
        // Para otros microservicios
        verificar_usuario_rol: 'GET /usuarios/verificar/{usuarioId}/{rol}'
      },
      
      roles_disponibles: ['cliente', 'emprendedor', 'organizador'],
      
      usuarios_por_defecto: {//esto es informacion base y prueba
        organizador: {
          email: 'admin@feria.com',
          password: 'admin123'
        },
        cliente: {
          email: 'cliente@ejemplo.com',
          password: 'cliente123'
        },
        emprendedor: {
          email: 'emprendedor@ejemplo.com',
          password: 'emprendedor123'
        }
      }
    };
  }
}