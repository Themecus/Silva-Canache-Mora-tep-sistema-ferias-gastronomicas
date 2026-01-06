import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiLog } from '../producto/entities/api-log.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(
    @InjectRepository(ApiLog)
    private logsRepository: Repository<ApiLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // Si es RPC (microservicio interno), request puede ser undefined, manejamos ese caso:
    if (!request) return next.handle(); 

    const { method, url, user } = request;
    const userId = user?.id || null; // Asume que el Gateway inyectó el usuario

    return next.handle().pipe(
      tap(async () => {
        // Caso Éxito (Status 200/201)
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || 200;
        await this.saveLog(url, method, userId, statusCode, 'Success');
      }),
      catchError(async (err) => {
        // Caso Error
        const statusCode = err.status || 500;
        const message = err.message || 'Internal Server Error';
        await this.saveLog(url, method, userId, statusCode, message);
        return throwError(() => err);
      }),
    );
  }

  private async saveLog(route: string, method: string, userId: string, statusCode: number, message: string) {
    try {
      await this.logsRepository.save({
        route,
        method,
        userId,
        statusCode,
        message,
      });
    } catch (e) {
      this.logger.error('Error guardando log en BD', e);
    }
  }
}