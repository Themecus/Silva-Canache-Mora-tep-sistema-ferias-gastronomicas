// src/app.module.ts
import { Module } from '@nestjs/common';
import { PuestosModule } from './puestos/puestos.module';
import { AppController } from './app.controller';

@Module({
  imports: [PuestosModule],
  controllers: [AppController],
})
export class AppModule {}