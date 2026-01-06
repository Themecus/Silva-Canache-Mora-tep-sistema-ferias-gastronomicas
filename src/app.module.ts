import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core'; // Importante
import { ProductoModule } from './producto/producto.module';
import { Producto } from './producto/entities/producto.entity';
import { ApiLog } from './producto/entities/api-log.entity';
import { LoggingInterceptor } from './common/logging.interceptor'; // Ajusta la ruta

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        // Cargamos ambas entidades
        entities: [Producto, ApiLog],
        synchronize: false, 
      }),
      inject: [ConfigService],
    }),
  
    TypeOrmModule.forFeature([ApiLog]), 
    ProductoModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}