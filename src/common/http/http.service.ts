import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CustomHttpService {
  constructor(private readonly httpService: HttpService) {}

  private getBaseUrl(): string {
    // TODO: En producción, esto debería apuntar al microservicio de usuarios real
    // Por ahora, todo está en el mismo servidor
    return 'http://localhost:3000/api';
  }

  async validarToken(token: string): Promise<any> {
    try {
      console.log('🔐 Validando token...');
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.getBaseUrl()}/usuarios/validar-token`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      console.log('✅ Token validado:', response.data.valido);
      return response.data;
    } catch (error) {
      console.error('❌ Error validando token:', error.message);
      return { 
        valido: false, 
        error: 'Error de comunicación con el servicio de autenticación'
      };
    }
  }

  async validarTokenYRol(token: string, rol: string): Promise<boolean> {
    try {
      console.log(`🔐 Validando token para rol: ${rol}`);
      
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
      console.error('❌ Error validando token y rol:', error.message);
      return false;
    }
  }

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
      console.error('❌ Error obteniendo usuario desde token:', error.message);
      throw new Error('Usuario no autenticado');
    }
  }

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
      console.error('❌ Error verificando usuario y rol:', error.message);
      return false;
    }
  }
}