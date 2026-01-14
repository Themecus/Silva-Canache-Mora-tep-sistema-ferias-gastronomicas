import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CustomHttpService {
  constructor(private readonly httpService: HttpService) {}

  private getBaseUrl(): string {
    //Todo se encuentra en el mismo servidor
    return 'http://localhost:3000/api';
  }

  //valida el token con las funciones de autenticacion
  async validarToken(token: string): Promise<any> {
    try {
      console.log('Validando token...');
      
      //realiza un GET al endpoint de validacion de token
      const response = await firstValueFrom(
        this.httpService.get(`${this.getBaseUrl()}/usuarios/validar-token`, {
          headers: { 
            Authorization: `Bearer ${token}`,//se envia el token de tipo bearer token
            'Content-Type': 'application/json'// aqui especificamos que es un json
          }
        })
      );
      
      console.log('Token validado:', response.data.valido);//mensaje de vlidacion
      return response.data;
    } catch (error) {
      console.error('Error validando token:', error.message);//mensaje de error
      return { 
        valido: false, 
        error: 'Error de comunicación con el servicio de autenticación'//mensaje de error de coenxion
      };
    }
  }

  //valida si tiene un rol ese token
  async validarTokenYRol(token: string, rol: string): Promise<boolean> {
    try {
      console.log(`Validando token para rol: ${rol}`);
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.getBaseUrl()}/usuarios/validar/${rol}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      return response.data.valido === true;
    } catch (error) {
      console.error('Error validando token y rol:', error.message);
      return false;
    }
  }

  //obtiene la informacion de un usuario usando su token
  async obtenerUsuarioDesdeToken(token: string): Promise<any> {
    try {
      console.log('👤 Obteniendo usuario desde token...');
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.getBaseUrl()}/usuarios/perfil`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      return response.data;
    } catch (error) {
      console.error('Error obteniendo usuario desde token:', error.message);
      throw new Error('Usuario no autenticado');
    }
  }
  //verificacamos si un usuario tiene un rol determinado
  async verificarUsuarioYRol(usuarioId: string, rol: string): Promise<boolean> {
    try {
      console.log(`🔍 Verificando usuario ${usuarioId} con rol ${rol}`);
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.getBaseUrl()}/usuarios/verificar/${usuarioId}/${rol}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
      
      return response.data.valido === true;
    } catch (error) {
      console.error('Error verificando usuario y rol:', error.message);
      return false;
    }
  }



  // Agregar al final de la clase CustomHttpService:

// Valida token y extrae información del usuario
async validarYExtraerUsuario(token: string): Promise<{ id: string; rol: string; email: string }> {
  const validacion = await this.validarToken(token);
  
  if (!validacion || !validacion.valido) {
    throw new Error('Token inválido o expirado');
  }
  
  return {
    id: validacion.usuario.id,
    rol: validacion.usuario.rol,
    email: validacion.usuario.email
  };
}

// Valida si un puesto está disponible para pedidos
async validarPuestoParaPedido(puestoId: string): Promise<{ valido: boolean; motivo?: string }> {
  try {
    console.log(`🔍 Validando puesto ${puestoId} para pedido...`);
    
    const response = await firstValueFrom(
      this.httpService.get(`${this.getBaseUrl()}/puestos/${puestoId}/validar-para-pedido`, {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    return response.data;
  } catch (error) {
    console.error('Error validando puesto:', error.message);
    return { valido: false, motivo: 'Error de comunicación con el servicio de puestos' };
  }
}

// Obtiene puestos de un emprendedor
async obtenerPuestosEmprendedor(emprendedorId: string): Promise<any[]> {
  try {
    console.log(`📋 Obteniendo puestos del emprendedor ${emprendedorId}...`);
    
    const response = await firstValueFrom(
      this.httpService.get(`${this.getBaseUrl()}/puestos/emprendedor/${emprendedorId}`, {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    return response.data;
  } catch (error) {
    console.error('Error obteniendo puestos:', error.message);
    return [];
  }
}

// Verifica si un usuario es dueño de un puesto
async verificarPropiedadPuesto(puestoId: string, usuarioId: string): Promise<boolean> {
  try {
    console.log(`👑 Verificando propiedad del puesto ${puestoId}...`);
    
    const response = await firstValueFrom(
      this.httpService.get(`${this.getBaseUrl()}/puestos/${puestoId}/verificar-propiedad/${usuarioId}`, {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    return response.data.esPropietario === true;
  } catch (error) {
    console.error('Error verificando propiedad:', error.message);
    return false;
  }
}


}

//Este .ts encapsula la logica del HTTP para otros microservicios
//siendo cosas como validacion, verificacion de roles e informacion de usuarios