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
}

//Este .ts encapsula la logica del HTTP para otros microservicios
//siendo cosas como validacion, verificacion de roles e informacion de usuarios