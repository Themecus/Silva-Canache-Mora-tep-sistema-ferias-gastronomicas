import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CustomHttpService } from './http.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,//tiempo de espera de 10s
      maxRedirects: 5,//cuantas redirecciones son posibles
    }),
  ],
  providers: [CustomHttpService],//los servicios que estaran disponibles
  exports: [CustomHttpService], // esto permite su uso en otros modulos
})
export class CustomHttpModule {}

//Este .ts actuara para hacer peticiones a otros microservcios cuando sea necesario
//valida tokens, crea comunicacion y verifica roles