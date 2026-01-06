import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('api_logs')
export class ApiLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 255 })
  route: string;

  @Column({ length: 20 })
  method: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'status_code', type: 'int' })
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  message: string;
}