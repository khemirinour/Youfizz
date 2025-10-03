import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested, IsNumberString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty() @IsUUID() articleId!: string;
  @ApiProperty() @IsInt() @Min(1) qty!: number;
  @ApiProperty({ description: 'Decimal string' }) @IsNumberString() price!: string;
}

export class CreateOrderDto {
  @ApiProperty({ maxLength: 30 }) @IsString() @MaxLength(30) number!: string;
  @ApiProperty({ type: [OrderItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) items!: OrderItemDto[];
  @ApiProperty({ description: 'Decimal string' }) @IsNumberString() total!: string;
  @ApiProperty() @IsString() customerId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vendorId?: string;
}


