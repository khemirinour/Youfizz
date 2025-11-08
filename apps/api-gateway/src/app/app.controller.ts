import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from '@you-fizz/shared';
import { Request } from 'express';

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
  @ApiOperation({ summary: 'Health check', description: 'Check API Gateway service health status' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
    };
  }

  // ==================== Auth Service Routes ====================
  @ApiTags('auth')
  @Post('auth/register')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account. Rate limited to 5 requests per minute.'
  })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request - validation errors' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiBody({ description: 'User registration data', schema: { type: 'object' } })
  async register(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/register', 'POST', body, headers);
  }

  @ApiTags('auth')
  @Post('auth/login')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user and receive access/refresh tokens. Rate limited to 10 requests per minute.'
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ description: 'Login credentials', schema: { type: 'object' } })
  async login(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/login', 'POST', body, headers);
  }

  @ApiTags('auth')
  @Post('auth/refresh')
  @ApiOperation({ summary: 'Refresh access token', description: 'Get a new access token using a valid refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiBody({ description: 'Refresh token data', schema: { type: 'object' } })
  async refresh(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/refresh', 'POST', body, headers);
  }

  @ApiTags('auth')
  @Post('auth/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user', description: 'Invalidate current session and refresh token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/logout', 'POST', body, headers, req.user);
  }

  @ApiTags('auth')
  @Post('auth/logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout from all devices', description: 'Invalidate all refresh tokens for the user' })
  @ApiResponse({ status: 200, description: 'Logged out from all devices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/logout-all', 'POST', body, headers, req.user);
  }

  @ApiTags('auth')
  @Get('auth/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'List all users (Admin only)',
    description: 'Get paginated list of all users. Returns additional data based on role (nbrCmdConf for VENDEUR, associated vendeurs for CONFERMATEUR).'
  })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by user role' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getUsers(@Query() query: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    const qs = new URLSearchParams(query as any).toString();
    const path = qs ? `/users?${qs}` : '/users';
    return this.gatewayService.forwardRequest(path, 'GET', null, headers, req.user);
  }

  @ApiTags('auth')
  @Get('auth/users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID (Admin only)', description: 'Retrieve detailed information about a specific user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/users/${id}`, 'GET', null, headers, req.user);
  }

  @ApiTags('auth')
  @Get('auth/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get available roles', description: 'Retrieve list of all available user roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRoles(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/roles', 'GET', null, headers, req.user);
  }

  @ApiTags('auth')
  @Patch('auth/users/:id/role/:role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user role (Admin only)', description: 'Change the role of a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'role', description: 'New role (admin, vendeur, confermateur, guest)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async updateUserRole(@Param('id') id: string, @Param('role') role: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/users/${id}/role/${role}`, 'PATCH', null, headers, req.user);
  }

  @ApiTags('auth')
  @Patch('auth/users/:id/active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user active status (Admin only)', description: 'Activate or deactivate a user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ description: 'Active status', schema: { type: 'object', properties: { isActive: { type: 'boolean' } } } })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async updateUserActive(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/users/${id}/active`, 'PATCH', body, headers, req.user);
  }

  @ApiTags('auth')
  @Patch('auth/users/:id/vendeur/nbr-cmd-conf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Increment vendeur nbrCmdConf (Admin only)',
    description: 'Increment the number of confirmed commands for a vendeur by a specified amount'
  })
  @ApiParam({ name: 'id', description: 'User ID (must be a vendeur)' })
  @ApiBody({ 
    description: 'Increment amount', 
    schema: { type: 'object', properties: { amount: { type: 'number', default: 1 } } }
  })
  @ApiResponse({ status: 200, description: 'nbrCmdConf incremented successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async incrementVendeurNbrCmdConf(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/users/${id}/vendeur/nbr-cmd-conf`, 'PATCH', body, headers, req.user);
  }

  @ApiTags('auth')
  @Delete('auth/users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user (Admin only)', description: 'Permanently delete a user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deleteUser(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/users/${id}`, 'DELETE', null, headers, req.user);
  }

  @ApiTags('auth')
  @Get('auth/vendeurs/:vendeurId/confermateurs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get confermateurs for a vendeur', description: 'Retrieve list of confermateurs associated with a vendeur' })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur ID' })
  @ApiResponse({ status: 200, description: 'Confermateurs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getVendeurConfermateurs(@Param('vendeurId') vendeurId: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/vendeurs/${vendeurId}/confermateurs`, 'GET', null, headers, req.user);
  }

  @ApiTags('auth')
  @Get('auth/confermateurs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all confermateurs', description: 'Get list of all confermateurs in the system' })
  @ApiResponse({ status: 200, description: 'Confermateurs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConfermateurs(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/confermateurs', 'GET', null, headers, req.user);
  }

  @ApiTags('auth')
  @Post('auth/confermateurs/:confermateurId/vendeurs/:vendeurId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assign vendeur to confermateur (Admin only)', description: 'Create an assignment relationship between a confermateur and a vendeur' })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur ID' })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur ID' })
  @ApiResponse({ status: 200, description: 'Vendeur assigned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async assignVendeurToConfermateur(@Param('confermateurId') confermateurId: string, @Param('vendeurId') vendeurId: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/confermateurs/${confermateurId}/vendeurs/${vendeurId}`, 'POST', null, headers, req.user);
  }

  @ApiTags('auth')
  @Delete('auth/confermateurs/:confermateurId/vendeurs/:vendeurId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unassign vendeur from confermateur (Admin only)', description: 'Remove assignment relationship between a confermateur and a vendeur' })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur ID' })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur ID' })
  @ApiResponse({ status: 200, description: 'Vendeur unassigned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async unassignVendeurFromConfermateur(@Param('confermateurId') confermateurId: string, @Param('vendeurId') vendeurId: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/confermateurs/${confermateurId}/vendeurs/${vendeurId}`, 'DELETE', null, headers, req.user);
  }

  @ApiTags('auth')
  @Post('auth/password-reset/request')
  @Throttle({ short: { limit: 3, ttl: 300000 } })
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send password reset email to user. Rate limited to 3 requests per 5 minutes.'
  })
  @ApiResponse({ status: 200, description: 'Password reset email sent (if account exists)' })
  @ApiBody({ description: 'Email address', schema: { type: 'object', properties: { email: { type: 'string' } } } })
  async requestPasswordReset(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/password-reset/request', 'POST', body, headers);
  }

  @ApiTags('auth')
  @Post('auth/password-reset/confirm')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  @ApiOperation({ 
    summary: 'Confirm password reset token',
    description: 'Verify if password reset token is valid. Rate limited to 10 requests per minute.'
  })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  @ApiBody({ description: 'Reset token', schema: { type: 'object', properties: { token: { type: 'string' } } } })
  async confirmPasswordResetToken(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/password-reset/confirm', 'POST', body, headers);
  }

  @ApiTags('auth')
  @Post('auth/password-reset/reset')
  @Throttle({ short: { limit: 5, ttl: 300000 } })
  @ApiOperation({ 
    summary: 'Reset password',
    description: 'Reset user password using valid reset token. Rate limited to 5 requests per 5 minutes.'
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiBody({ description: 'Reset token and new password', schema: { type: 'object' } })
  async resetPassword(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/password-reset/reset', 'POST', body, headers);
  }

  // ==================== Article Service Routes ====================
  @ApiTags('articles')
  @Get('articles')
  @ApiOperation({ 
    summary: 'List articles',
    description: 'Get paginated list of articles with optional filters (search, category, vendor, status, visibility)'
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'vendorId', required: false, description: 'Filter by vendor ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], description: 'Filter by status' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default: 0)' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  async getArticles(@Query() query: any, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest('/articles', 'GET', null, headers);
  }

  @ApiTags('articles')
  @Post('articles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create article', description: 'Create a new article. Requires ADMIN or VENDEUR role.' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' })
  @ApiBody({ description: 'Article data', schema: { type: 'object' } })
  async createArticle(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/articles', 'POST', body, headers, req.user);
  }

  @ApiTags('articles')
  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article by ID', description: 'Retrieve detailed information about a specific article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getArticle(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'GET', null, headers);
  }

  @ApiTags('articles')
  @Get('articles/vendor/:vendorId')
  @ApiOperation({ 
    summary: 'Get articles by vendor ID', 
    description: 'Retrieve paginated articles belonging to a specific vendor with optional filters' 
  })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT','PUBLISHED','ARCHIVED'] })
  @ApiQuery({ name: 'isActive', required: false, description: 'true for active, false for inactive' })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 20, minimum: 1 } })
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, minimum: 0 } })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  async getArticlesByVendor(
    @Param('vendorId') vendorId: string, 
    @Query() query: Record<string, any>,
    @Headers() headers: Record<string, string>
  ) {
    // Build path with query parameters
    const queryParams = new URLSearchParams();
    if (query.search) queryParams.set('search', query.search);
    if (query.status) queryParams.set('status', query.status);
    if (query.isActive !== undefined) queryParams.set('isActive', query.isActive);
    if (query.limit) queryParams.set('limit', query.limit.toString());
    if (query.offset) queryParams.set('offset', query.offset.toString());
    
    const queryString = queryParams.toString();
    const path = queryString 
      ? `/articles/vendor/${vendorId}?${queryString}`
      : `/articles/vendor/${vendorId}`;

    return this.gatewayService.forwardRequest(path, 'GET', null, headers);
  }

  @ApiTags('articles')
  @Put('articles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update article', description: 'Update an existing article. Requires ADMIN or VENDEUR role.' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiBody({ description: 'Updated article data', schema: { type: 'object' } })
  async updateArticle(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'PUT', body, headers, req.user);
  }

  @ApiTags('articles')
  @Patch('articles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update article', description: 'Update an existing article. Requires ADMIN or VENDEUR role.' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiBody({ description: 'Updated article data', schema: { type: 'object' } })
  async patchArticle(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'PATCH', body, headers, req.user);
  }

  @ApiTags('articles')
  @Delete('articles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete article (Admin only)', description: 'Permanently delete an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deleteArticle(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'DELETE', null, headers, req.user);
  }

  @ApiTags('articles')
  @Patch('articles/:id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activate article', description: 'Make an article visible/active. Requires ADMIN or VENDEUR role.' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article activated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' })
  async activateArticle(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/articles/${id}/activate`, 'PATCH', null, headers, req.user);
  }

  @ApiTags('articles')
  @Patch('articles/:id/deactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate article', description: 'Hide/deactivate an article. Requires ADMIN or VENDEUR role.' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' })
  async deactivateArticle(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/articles/${id}/deactivate`, 'PATCH', null, headers, req.user);
  }

  // ==================== Order Service Routes ====================
  @ApiTags('orders')
  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'List orders',
    description: 'Get paginated list of orders. Accessible by ADMIN, VENDEUR, or CONFERMATEUR roles.'
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by order number' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], description: 'Filter by status' })
  @ApiQuery({ name: 'vendorId', required: false, description: 'Filter by vendor ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default: 0)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrders(@Query() query: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/orders', 'GET', null, headers, req.user);
  }

  @ApiTags('orders')
  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create order', description: 'Create a new order. Requires ADMIN or VENDEUR role.' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' })
  @ApiBody({ description: 'Order data', schema: { type: 'object' } })
  async createOrder(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/orders', 'POST', body, headers, req.user);
  }

  @ApiTags('orders')
  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order by ID', description: 'Retrieve detailed information about a specific order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'GET', null, headers, req.user);
  }

  @ApiTags('orders')
  @Put('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update order', description: 'Update an existing order. Requires ADMIN, VENDEUR, or CONFERMATEUR role.' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiBody({ description: 'Updated order data', schema: { type: 'object' } })
  async updateOrder(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'PUT', body, headers, req.user);
  }

  @ApiTags('orders')
  @Delete('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete order (Admin only)', description: 'Permanently delete an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deleteOrder(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'DELETE', null, headers, req.user);
  }

  @ApiTags('orders')
  @Patch('orders/:id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Confirm order',
    description: 'Confirm an order (consumes vendeur confirmation quota). Requires VENDEUR or CONFERMATEUR role.'
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order confirmed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires VENDEUR or CONFERMATEUR role, or no remaining confirmations' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async confirmOrder(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/orders/${id}/confirm`, 'PATCH', null, headers, req.user);
  }

  @ApiTags('orders')
  @Patch('orders/:id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activate order', description: 'Activate an order. Requires ADMIN, VENDEUR, or CONFERMATEUR role.' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order activated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async activateOrder(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/orders/${id}/activate`, 'PATCH', null, headers, req.user);
  }

  @ApiTags('orders')
  @Patch('orders/:id/deactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate order', description: 'Deactivate an order. Requires ADMIN, VENDEUR, or CONFERMATEUR role.' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deactivateOrder(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/orders/${id}/deactivate`, 'PATCH', null, headers, req.user);
  }

  // ==================== User Profile Routes ====================
  @ApiTags('profile')
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile', description: 'Retrieve authenticated user profile information' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/profile', 'GET', null, headers, req.user);
  }

  @ApiTags('profile')
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile', description: 'Update authenticated user profile information' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ description: 'Updated profile data', schema: { type: 'object' } })
  async updateProfile(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/profile', 'PUT', body, headers, req.user);
  }

  // ==================== Notification Routes ====================
  @ApiTags('notifications')
  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get notifications', description: 'Retrieve notifications for authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNotifications(@Query() query: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/notifications', 'GET', null, headers, req.user);
  }

  @ApiTags('notifications')
  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark notification as read', description: 'Mark a notification as read for authenticated user' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markNotificationRead(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/notifications/${id}/read`, 'PATCH', null, headers, req.user);
  }

  // ==================== Statistics Routes ====================
  @ApiTags('statistics')
  @Get('stats/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user statistics (Admin only)',
    description: 'Retrieve comprehensive user statistics including total count, breakdown by role, active/inactive counts, and vendeurs with confirmed commands'
  })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getUserStats(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/stats/users', 'GET', null, headers, req.user);
  }

  @ApiTags('statistics')
  @Get('stats/orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get order statistics (Admin only)',
    description: 'Retrieve comprehensive order statistics including total count, breakdown by status, paid/unpaid counts, active/inactive counts, and total revenue'
  })
  @ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getOrderStats(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/stats/orders', 'GET', null, headers, req.user);
  }

  @ApiTags('statistics')
  @Get('stats/articles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get article statistics (Admin only)',
    description: 'Retrieve comprehensive article statistics including total count, breakdown by status, active/inactive counts, and total stock quantity'
  })
  @ApiResponse({ status: 200, description: 'Article statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getArticleStats(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/stats/articles', 'GET', null, headers, req.user);
  }
}
