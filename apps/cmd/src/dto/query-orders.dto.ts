import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class QueryOrdersDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: OrderStatus }) @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() customerName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerPhone?: string;
  @ApiProperty({ description: 'Filter by vendor ID' })
  @Type(() => String)
  @IsString()
  vendorId: string;
  @ApiPropertyOptional({ description: 'Filter by active' }) @IsOptional() isActive?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 200, default: 20 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) limit?: number = 20;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) offset?: number = 0;
}


