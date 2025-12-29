// src/usuarios/usuarios.module.ts
import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { CustomHttpModule } from '../common/http/http.module'; // OPCIONAL

@Module({
  imports: [CustomHttpModule], // OPCIONAL - solo si UsuariosService necesita CustomHttpService
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}