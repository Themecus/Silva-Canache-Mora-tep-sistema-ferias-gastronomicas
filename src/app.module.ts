import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductoModule } from './producto/producto.module';

@Module({
  imports: [ProductoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
