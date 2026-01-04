import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { CustomHttpModule } from '../common/http/http.module'; // OPCIONAL

@Module({
  imports: [CustomHttpModule], // OPCIONAL, solo para comunicarse con HTTP
  controllers: [UsuariosController],//controlador de manejo de rutas de usuarios
  providers: [UsuariosService],//la logica de usuario y las autenticaciones
  exports: [UsuariosService],//exportacion donde se requiera
})
export class UsuariosModule {}
//organiza y exporta los componenetes relaciones a los usuarios
