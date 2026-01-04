import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PuestosModule } from './puestos/puestos.module';
import { UsuariosModule } from './usuarios/usuarios.module'; 
import { CustomHttpModule } from './common/http/http.module';

@Module({
  imports: [
    CustomHttpModule,//modulo de comunicacion entre microservicios
    PuestosModule,//gestion de puestos
    UsuariosModule, // gestion d eusuario sy autticacion
  ],
  controllers: [AppController],//control que sirve como API gateway
  providers: [AppService],//servicio prinicpal de la aplicacion
})
export class AppModule {}
//organiza y exporta los componenetes relaciones del sistema en general de la feria de comida
