import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested, IsNumberString, IsUUID, IsInt, Min, IsBoolean, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty() @IsUUID() articleId!: string;
  @ApiProperty() @IsInt() @Min(1) qty!: number;
  @ApiProperty({ description: 'Decimal string' }) @IsNumberString() price!: string;
  @ApiPropertyOptional({ description: 'Whether delivery is selected for this item' }) @IsOptional() @IsBoolean() hasDelivery?: boolean;
  @ApiPropertyOptional({ description: 'Selected delivery destination/region. Required if hasDelivery is true' }) 
  @ValidateIf((o) => o.hasDelivery === true)
  @IsString()
  destination?: string;
  @ApiPropertyOptional({ description: 'Delivery price for this item. Required if hasDelivery is true' }) 
  @ValidateIf((o) => o.hasDelivery === true)
  @IsNumberString()
  deliveryPrice?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) items!: OrderItemDto[];
  @ApiProperty({ description: 'Decimal string' }) @IsNumberString() total!: string;
  @ApiProperty() @IsString() customerId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) customerName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) customerEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) customerPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) customerAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vendorId?: string;
  @ApiPropertyOptional({ description: 'Customer remarks/notes for the order' }) @IsOptional() @IsString() remarque?: string;
}
