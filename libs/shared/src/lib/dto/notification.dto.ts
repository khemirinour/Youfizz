import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(['info', 'warning', 'error', 'success'])
  type?: 'info' | 'warning' | 'error' | 'success';
}
