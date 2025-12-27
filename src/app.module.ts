import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AppController } from './app.controller';

@Module({
  imports: [UsuariosModule], // Solo usuarios, todo incluido
  controllers: [AppController]
})
export class AppModule {}