import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Delete, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { QueryOrdersDto } from '../dto/query-orders.dto';
import { JwtAuthGuard } from '@you-fizz/shared';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Order } from '../entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'List orders' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'VENDEUR', 'CONFERMATEUR')
  @ApiQuery({ name: 'search', required: false, description: 'Order number contains' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'] })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 20, minimum: 1 } })
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, minimum: 0 } })
  @ApiOkResponse({ description: 'Orders retrieved', type: [Order] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  list(@Query() query: QueryOrdersDto) {
    return this.appService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create order (guest allowed)' })
  @ApiCreatedResponse({ description: 'Order created', type: Order })
  create(@Body() dto: CreateOrderDto) {
    return this.appService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiOkResponse({ description: 'Order retrieved', type: Order })
  get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'VENDEUR', 'CONFERMATEUR')
  @ApiOkResponse({ description: 'Order updated', type: Order })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateOrderDto) {
    return this.appService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOkResponse({ description: 'Order deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.remove(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm order' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDEUR', 'CONFERMATEUR')
  @ApiOkResponse({ description: 'Order confirmed', type: Order })
  confirm(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: Request) {
    // Extract user data from JWT token (same logic as login token)
    const user = req.user as any; // Type assertion to avoid linter conflicts
    const userData = {
      userId: user?.userId,           // User ID from token
      role: user?.role,                // User role
      vendorId: user?.vendorId,     // Vendor ID from token (if vendeur)
      confirmateurId: user?.confirmateurId, // Confirmateur ID from token (if confermateur)
    };
    return this.appService.confirm(id, userData);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate order (active)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'VENDEUR', 'CONFERMATEUR')
  @ApiOkResponse({ description: 'Order activated', type: Order })
  activate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.setActive(id, true);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate order (inactive)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'VENDEUR', 'CONFERMATEUR')
  @ApiOkResponse({ description: 'Order deactivated', type: Order })
  deactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.setActive(id, false);
  }

  @Get('stats/orders')
  @ApiOperation({ 
    summary: 'Admin: Get order statistics',
    description: 'Returns comprehensive statistics about orders including total count, breakdown by status, paid/unpaid counts, active/inactive counts, and total revenue.'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOkResponse({ 
    description: 'Order statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of orders' },
        byStatus: { 
          type: 'object', 
          description: 'Orders count by status',
          additionalProperties: { type: 'number' },
          example: { PENDING: 10, CONFIRMED: 5, SHIPPED: 3, DELIVERED: 20, CANCELLED: 2 }
        },
        paid: { type: 'number', description: 'Number of paid orders' },
        unpaid: { type: 'number', description: 'Number of unpaid orders' },
        active: { type: 'number', description: 'Number of active orders' },
        inactive: { type: 'number', description: 'Number of inactive orders' },
        totalRevenue: { type: 'number', description: 'Total revenue from all orders' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async getOrderStats() {
    return this.appService.getOrderStats();
  }
}
