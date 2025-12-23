import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [UsuarioModule, UsuariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
