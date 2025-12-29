// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PuestosModule } from './puestos/puestos.module';
import { UsuariosModule } from './usuarios/usuarios.module'; // AÑADE ESTA LINEA
import { CustomHttpModule } from './common/http/http.module';

@Module({
  imports: [
    CustomHttpModule,
    PuestosModule,
    UsuariosModule, // AÑADE ESTA LINEA
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}