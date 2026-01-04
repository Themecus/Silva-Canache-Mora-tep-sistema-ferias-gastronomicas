import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo(): any {
    return {
      servicio: 'Sistema de Ferias Gastronómicas - API Gateway',
      version: '1.0.0',
      estado: 'activo',
      descripcion: 'Sistema distribuido para gestión de ferias gastronómicas',
      
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
      
      endpoints: {
        // ==================== AUTENTICACIÓN ====================
        autenticacion: {
          registro: 'POST /api/usuarios/registro',
          login: 'POST /api/usuarios/login',
          perfil: 'GET /api/usuarios/perfil (requiere token)',
          logout: 'POST /api/usuarios/logout',
          validar_token: 'GET /api/usuarios/validar-token (requiere token)',
          validar_token_rol: 'GET /api/usuarios/validar/{rol} (requiere token)'
        },
        
        // ==================== GESTIÓN DE USUARIOS ====================
        usuarios: {
          crear_usuario: 'POST /api/usuarios',
          listar_usuarios: 'GET /api/usuarios',
          listar_por_rol: 'GET /api/usuarios?rol=cliente|emprendedor|organizador',
          obtener_usuario: 'GET /api/usuarios/:id',
          buscar_por_email: 'GET /api/usuarios/email/:email',
          actualizar_usuario: 'PATCH /api/usuarios/:id',
          desactivar_usuario: 'DELETE /api/usuarios/:id',
          estadisticas: 'GET /api/usuarios/estadisticas'
        },
        
        // ==================== GESTIÓN DE PUESTOS ====================
        puestos: {
          // CRUD 
          crear_puesto: 'POST /api/puestos (requiere token de emprendedor)',
          listar_puestos: 'GET /api/puestos',
          obtener_puesto: 'GET /api/puestos/:id',
          actualizar_puesto: 'PATCH /api/puestos/:id (requiere ser dueño)',
          eliminar_puesto: 'DELETE /api/puestos/:id (requiere ser dueño, solo pendientes)',
          
          // Filtros de busqueda
          puestos_activos: 'GET /api/puestos/activos',
          puestos_por_estado: 'GET /api/puestos?estado=pendiente|aprobado|activo|inactivo',
          puestos_por_emprendedor: 'GET /api/puestos/emprendedor/:emprendedorId',
          
          // Control de estado
          aprobar_puesto: 'PATCH /api/puestos/:id/estado (solo organizadores, estado: "aprobado")',
          activar_puesto: 'PATCH /api/puestos/:id/estado (solo organizadores, estado: "activo")',
          inactivar_puesto: 'PATCH /api/puestos/:id/estado (dueño u organizador, estado: "inactivo")',
          
          // Verificaciones para otros microservicios
          verificar_puesto_activo: 'GET /api/puestos/:id/verificar-activo',
          verificar_propiedad: 'GET /api/puestos/:id/verificar-propiedad/:emprendedorId',
          validar_para_pedido: 'GET /api/puestos/:id/validar-para-pedido'
        },
        
        // ==================== PARA OTROS MICROSERVICIOS ====================
        servicios_internos: {
          verificar_usuario_rol: 'GET /api/usuarios/verificar/{usuarioId}/{rol}',
          validar_puesto_activo: 'GET /api/puestos/:id/verificar-activo',
          validar_propiedad_puesto: 'GET /api/puestos/:id/verificar-propiedad/:emprendedorId'
        }
      },
      
      // ==================== ROLES Y PERMISOS ====================
      roles_disponibles: [
        {
          rol: 'cliente',
          descripcion: 'Puede ver catálogo y hacer pedidos',
          permisos: ['ver_puestos_activos', 'ver_productos', 'crear_pedidos']
        },
        {
          rol: 'emprendedor',
          descripcion: 'Puede gestionar su puesto y productos',
          permisos: ['crear_puesto', 'gestionar_su_puesto', 'gestionar_productos']
        },
        {
          rol: 'organizador',
          descripcion: 'Puede aprobar/activar puestos y ver estadísticas',
          permisos: ['aprobar_puestos', 'activar_puestos', 'ver_estadisticas', 'ver_todos_los_puestos']
        }
      ],
      
      // ==================== ESTADOS DE PUESTOS ====================
      estados_puesto: [
        {
          estado: 'pendiente',
          descripcion: 'Recién creado, esperando aprobación',
          puede_editar: 'solo el dueño',
          siguiente_estado: 'aprobado (por organizador)'
        },
        {
          estado: 'aprobado',
          descripcion: 'Aprobado por organizador, listo para activar',
          puede_editar: 'solo el dueño',
          siguiente_estado: 'activo (por organizador) o inactivo'
        },
        {
          estado: 'activo',
          descripcion: 'Disponible para el público',
          puede_editar: 'nadie (no editable)',
          siguiente_estado: 'inactivo'
        },
        {
          estado: 'inactivo',
          descripcion: 'No disponible temporal o permanentemente',
          puede_editar: 'solo el dueño',
          siguiente_estado: 'activo (por organizador)'
        }
      ],
      
      // ==================== EJEMPLOS YA LISTOS ====================
      usuarios_por_defecto: {
        organizador: {
          email: 'admin@feria.com',
          password: 'admin123',
          descripcion: 'Usuario administrador con todos los permisos'
        },
        cliente: {
          email: 'cliente@ejemplo.com',
          password: 'cliente123',
          descripcion: 'Usuario cliente para pruebas'
        },
        emprendedor: {
          email: 'emprendedor@ejemplo.com',
          password: 'emprendedor123',
          descripcion: 'Usuario emprendedor para crear puestos'
        }
      },
      
      // ==================== NOTAS IMPORTANTES ====================
      notas: [
        'Todos los endpoints de puestos requieren validación de token',
        'Los endpoints que modifican puestos requieren que el usuario sea el dueño',
        'Solo organizadores pueden cambiar estado a "aprobado" o "activo"',
        'Los puestos en estado "activo" no pueden ser editados',
        'Use el header: Authorization: Bearer {token} para autenticación',
        'Para cambios de estado use headers: x-user-id y x-user-rol'
      ]
    };
  }
}

//esto es una pequena documentacion de acceso para cada endpoint organizados cada uno