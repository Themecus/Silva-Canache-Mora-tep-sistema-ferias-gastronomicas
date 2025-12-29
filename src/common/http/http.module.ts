import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CustomHttpService } from './http.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [CustomHttpService],
  exports: [CustomHttpService], // ¡IMPORTANTE! Esto debe estar
})
export class CustomHttpModule {}