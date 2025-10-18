import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Headers, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from '@you-fizz/shared';
import { Request, Response } from 'express';

@ApiTags('api-gateway')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly gatewayService: GatewayService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
    };
  }

  // Auth service routes
  @Post('auth/register')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async register(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/register', 'POST', body, headers);
  }

  @Post('auth/login')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async login(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/login', 'POST', body, headers);
  }

  @Post('auth/refresh')
  async refresh(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/refresh', 'POST', body, headers);
  }

  @Post('auth/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async logout(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/logout', 'POST', body, headers, req.user);
  }

  @Get('auth/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUsers(@Query() query: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/users', 'GET', null, headers, req.user);
  }

  // Article service routes
  @Get('articles')
  async getArticles(@Query() query: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/articles', 'GET', null, headers);
  }

  @Post('articles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createArticle(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/articles', 'POST', body, headers, req.user);
  }

  @Get('articles/:id')
  async getArticle(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'GET', null, headers);
  }

  @Put('articles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateArticle(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'PUT', body, headers, req.user);
  }

  @Delete('articles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteArticle(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'DELETE', null, headers, req.user);
  }

  // CMD service routes
  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getOrders(@Query() query: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/orders', 'GET', null, headers, req.user);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createOrder(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/orders', 'POST', body, headers, req.user);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getOrder(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'GET', null, headers, req.user);
  }

  @Put('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateOrder(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'PUT', body, headers, req.user);
  }

  @Delete('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteOrder(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'DELETE', null, headers, req.user);
  }

  // User service routes
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/profile', 'GET', null, headers, req.user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateProfile(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/profile', 'PUT', body, headers, req.user);
  }

  // Notification service routes
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getNotifications(@Query() query: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/notifications', 'GET', null, headers, req.user);
  }

  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async markNotificationRead(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/notifications/${id}/read`, 'PATCH', null, headers, req.user);
  }
}
