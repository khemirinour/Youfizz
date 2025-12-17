import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Headers, Req, Res, UseGuards, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException, Logger } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard, getApiGatewayUrl } from '@you-fizz/shared';
import { Request } from 'express';
import  FormData from 'form-data';

@ApiTags('api-gateway')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

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
  async register(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any) {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    this.logger.log(`[REGISTER] Client IP extracted: ${clientIp} (req.ip: ${req.ip}, remoteAddress: ${req.connection?.remoteAddress})`);
    return this.gatewayService.forwardRequest('/register', 'POST', body, headers, undefined, false, false, undefined, clientIp);
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
  async login(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any, @Res({ passthrough: true }) res: any) {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    this.logger.log(`[LOGIN] Client IP extracted: ${clientIp} (req.ip: ${req.ip}, remoteAddress: ${req.connection?.remoteAddress})`);
    const result = await this.gatewayService.forwardRequest('/login', 'POST', body, headers, undefined, false, true, req.cookies, clientIp);
    // Forward Set-Cookie headers from auth service to client
    if (result.headers && result.headers['set-cookie']) {
      const cookies = Array.isArray(result.headers['set-cookie'])
        ? result.headers['set-cookie']
        : [result.headers['set-cookie']];
      cookies.forEach((cookie: string) => {
        res.appendHeader('Set-Cookie', cookie);
      });
    }
    return result.data;
  }

  @ApiTags('auth')
  @Post('auth/refresh')
  @ApiOperation({ summary: 'Refresh access token', description: 'Get a new access token using a valid refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiBody({ description: 'Refresh token data', schema: { type: 'object' } })
  async refresh(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any, @Res({ passthrough: true }) res: any) {
    const result = await this.gatewayService.forwardRequest('/refresh', 'POST', body, headers, undefined, false, true, req.cookies);
    // Forward Set-Cookie headers from auth service to client
    if (result.headers && result.headers['set-cookie']) {
      const cookies = Array.isArray(result.headers['set-cookie'])
        ? result.headers['set-cookie']
        : [result.headers['set-cookie']];
      cookies.forEach((cookie: string) => {
        res.appendHeader('Set-Cookie', cookie);
      });
    }
    return result.data;
  }

  @ApiTags('auth')
  @Post('auth/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user', description: 'Invalidate current session and refresh token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any, @Res({ passthrough: true }) res: any) {
    const result = await this.gatewayService.forwardRequest('/logout', 'POST', body, headers, req.user, false, true, req.cookies);
    // Forward Set-Cookie headers from auth service to client (for clearing cookies)
    if (result.headers && result.headers['set-cookie']) {
      const cookies = Array.isArray(result.headers['set-cookie'])
        ? result.headers['set-cookie']
        : [result.headers['set-cookie']];
      cookies.forEach((cookie: string) => {
        res.appendHeader('Set-Cookie', cookie);
      });
    }
    return result.data;
  }

  @ApiTags('auth')
  @Post('auth/logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout from all devices', description: 'Invalidate all refresh tokens for the user' })
  @ApiResponse({ status: 200, description: 'Logged out from all devices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any, @Res({ passthrough: true }) res: any) {
    const result = await this.gatewayService.forwardRequest('/logout-all', 'POST', body, headers, req.user, false, true, req.cookies);
    // Forward Set-Cookie headers from auth service to client (for clearing cookies)
    if (result.headers && result.headers['set-cookie']) {
      const cookies = Array.isArray(result.headers['set-cookie'])
        ? result.headers['set-cookie']
        : [result.headers['set-cookie']];
      cookies.forEach((cookie: string) => {
        res.appendHeader('Set-Cookie', cookie);
      });
    }
    return result.data;
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
    return this.gatewayService.forwardRequest(path, 'GET', null, headers, req.user, false, false, (req as any).cookies);
  }

  @ApiTags('auth')
  @Get('auth/users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve detailed information about a specific user. Admin can access any user, regular users can only access their own profile.' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot access other users\' profiles' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/users/${id}`, 'GET', null, headers, req.user, false, false, (req as any).cookies);
  }

  @ApiTags('auth')
  @Patch('auth/users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update user profile', 
    description: 'Update user profile information (firstName, lastName, email). Admin can update any user, regular users can only update their own profile.' 
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot update other users\' profiles' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string, 
    @Body() body: any, 
    @Headers() headers: Record<string, string>, 
    @Req() req: Request
  ) {
    return this.gatewayService.forwardRequest(`/users/${id}`, 'PATCH', body, headers, req.user, false, false, (req as any).cookies);
  }

  @ApiTags('auth')
  @Get('auth/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get available roles', description: 'Retrieve list of all available user roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRoles(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/roles', 'GET', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/users/${id}/role/${role}`, 'PATCH', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/users/${id}/active`, 'PATCH', body, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/users/${id}/vendeur/nbr-cmd-conf`, 'PATCH', body, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/users/${id}`, 'DELETE', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/vendeurs/${vendeurId}/confermateurs`, 'GET', null, headers, req.user, false, false, (req as any).cookies);
  }

  @ApiTags('auth')
  @Delete('auth/vendeurs/:vendeurId/confermateurs/:confermateurId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remove confermateur from vendeur',
    description: 'Allow an authenticated vendor to remove/unassign an associated confermateur.',
  })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur user ID' })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiResponse({ status: 200, description: 'Association removed (or no association existed)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeVendeurConfermateur(
    @Param('vendeurId') vendeurId: string,
    @Param('confermateurId') confermateurId: string,
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    return this.gatewayService.forwardRequest(
      `/vendeurs/${vendeurId}/confermateurs/${confermateurId}`,
      'DELETE',
      null,
      headers,
      req.user,
    );
  }

  @ApiTags('auth')
  @Post('auth/vendeurs/:vendeurId/request-confermateur')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Request confermateur assignment',
    description: 'Send an email request to a confermateur to become assigned to this vendor. Vendor can only request for themselves.'
  })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur user ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        confermateurEmail: { type: 'string', format: 'email', description: 'Confermateur email address' }
      },
      required: ['confermateurEmail']
    }
  })
  @ApiResponse({ status: 201, description: 'Assignment request email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or confermateur not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Vendeur role required' })
  async requestConfermateurAssignment(
    @Param('vendeurId') vendeurId: string,
    @Body() body: { confermateurEmail: string },
    @Headers() headers: Record<string, string>,
    @Req() req: Request
  ) {
    return this.gatewayService.forwardRequest(
      `/vendeurs/${vendeurId}/request-confermateur`,
      'POST',
      body,
      headers,
      req.user
    );
  }

  @ApiTags('auth')
  @Get('auth/confermateurs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all confermateurs', description: 'Get list of all confermateurs in the system' })
  @ApiResponse({ status: 200, description: 'Confermateurs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConfermateurs(@Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/confermateurs', 'GET', null, headers, req.user, false, false, (req as any).cookies);
  }

  @ApiTags('auth')
  @Get('auth/confermateurs/:confermateurId/vendeurs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get vendors for a confermateur',
    description: 'Retrieve list of vendors associated with the authenticated confermateur',
  })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiResponse({ status: 200, description: 'Vendors retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConfermateurVendeurs(
    @Param('confermateurId') confermateurId: string,
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    return this.gatewayService.forwardRequest(
      `/confermateurs/${confermateurId}/vendeurs`,
      'GET',
      null,
      headers,
      req.user,
    );
  }

  @ApiTags('auth')
  @Get('auth/confermateurs/:confermateurId/accept-vendeur/:vendeurId')
  @ApiOperation({
    summary: 'Accept vendeur assignment request (GET)',
    description: 'Renders a page that automatically submits the acceptance request. Accessed via email link.'
  })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur user ID' })
  async acceptVendeurAssignmentGet(
    @Param('confermateurId') confermateurId: string,
    @Param('vendeurId') vendeurId: string,
    @Res() res: any
  ) {
    const apiBaseUrl = getApiGatewayUrl();
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Accepting Assignment...</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #28a745; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Accepting Assignment Request...</h2>
            <div class="spinner"></div>
            <p>Please wait while we process your request.</p>
            <form id="acceptForm" method="POST" action="${apiBaseUrl}/api/auth/confermateurs/${confermateurId}/accept-vendeur/${vendeurId}">
            </form>
            <script>
              document.getElementById('acceptForm').submit();
            </script>
          </div>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @ApiTags('auth')
  @Post('auth/confermateurs/:confermateurId/accept-vendeur/:vendeurId')
  @ApiOperation({
    summary: 'Accept vendeur assignment request',
    description: 'Accept a vendeur assignment request. This endpoint is public and accessed via email link.'
  })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur user ID' })
  @ApiResponse({ status: 200, description: 'Assignment accepted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or assignment failed' })
  async acceptVendeurAssignment(
    @Param('confermateurId') confermateurId: string,
    @Param('vendeurId') vendeurId: string,
    @Headers() headers: Record<string, string> = {}
  ) {
    return this.gatewayService.forwardRequest(
      `/confermateurs/${confermateurId}/accept-vendeur/${vendeurId}`,
      'POST',
      null,
      headers
    );
  }

  @ApiTags('auth')
  @Get('auth/confermateurs/:confermateurId/refuse-vendeur/:vendeurId')
  @ApiOperation({
    summary: 'Refuse vendeur assignment request (GET)',
    description: 'Renders a page that automatically submits the refusal request. Accessed via email link.'
  })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur user ID' })
  async refuseVendeurAssignmentGet(
    @Param('confermateurId') confermateurId: string,
    @Param('vendeurId') vendeurId: string,
    @Res() res: any
  ) {
    const apiBaseUrl = getApiGatewayUrl();
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Refusing Assignment...</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #dc3545; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Refusing Assignment Request...</h2>
            <div class="spinner"></div>
            <p>Please wait while we process your request.</p>
            <form id="refuseForm" method="POST" action="${apiBaseUrl}/api/auth/confermateurs/${confermateurId}/refuse-vendeur/${vendeurId}">
            </form>
            <script>
              document.getElementById('refuseForm').submit();
            </script>
          </div>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @ApiTags('auth')
  @Post('auth/confermateurs/:confermateurId/refuse-vendeur/:vendeurId')
  @ApiOperation({
    summary: 'Refuse vendeur assignment request',
    description: 'Refuse a vendeur assignment request. This endpoint is public and accessed via email link.'
  })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur user ID' })
  @ApiResponse({ status: 200, description: 'Assignment request refused successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async refuseVendeurAssignment(
    @Param('confermateurId') confermateurId: string,
    @Param('vendeurId') vendeurId: string,
    @Headers() headers: Record<string, string> = {}
  ) {
    return this.gatewayService.forwardRequest(
      `/confermateurs/${confermateurId}/refuse-vendeur/${vendeurId}`,
      'POST',
      null,
      headers
    );
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
    return this.gatewayService.forwardRequest(`/confermateurs/${confermateurId}/vendeurs/${vendeurId}`, 'POST', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/confermateurs/${confermateurId}/vendeurs/${vendeurId}`, 'DELETE', null, headers, req.user, false, false, (req as any).cookies);
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
  async requestPasswordReset(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any) {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    this.logger.log(`[PASSWORD-RESET-REQUEST] Client IP extracted: ${clientIp} (req.ip: ${req.ip}, remoteAddress: ${req.connection?.remoteAddress})`);
    return this.gatewayService.forwardRequest('/password-reset/request', 'POST', body, headers, undefined, false, false, undefined, clientIp);
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
  async confirmPasswordResetToken(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any) {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    this.logger.log(`[PASSWORD-RESET-CONFIRM] Client IP extracted: ${clientIp} (req.ip: ${req.ip}, remoteAddress: ${req.connection?.remoteAddress})`);
    return this.gatewayService.forwardRequest('/password-reset/confirm', 'POST', body, headers, undefined, false, false, undefined, clientIp);
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
  async resetPassword(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any) {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    this.logger.log(`[PASSWORD-RESET-RESET] Client IP extracted: ${clientIp} (req.ip: ${req.ip}, remoteAddress: ${req.connection?.remoteAddress})`);
    return this.gatewayService.forwardRequest('/password-reset/reset', 'POST', body, headers, undefined, false, false, undefined, clientIp);
  }

  @ApiTags('auth')
  @Get('auth/users/by-email/:email')
  @ApiOperation({
    summary: 'Find user by email',
    description: 'Find a user by email address with optional role filter. Public endpoint.'
  })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'vendeur', 'confermateur', 'guest'], description: 'Filter by user role' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserByEmail(
    @Param('email') email: string,
    @Query('role') role?: string,
    @Headers() headers: Record<string, string> = {},
  ) {
    // Keep email URL-encoded when forwarding - NestJS will decode it in the auth service
    // Re-encode to ensure proper URL format (handles cases where it might already be decoded)
    const encodedEmail = encodeURIComponent(decodeURIComponent(email));
    const path = role ? `/users/by-email/${encodedEmail}?role=${role}` : `/users/by-email/${encodedEmail}`;
    return this.gatewayService.forwardRequest(path, 'GET', null, headers);
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
  @ApiQuery({ name: 'categoryIds', required: false, type: [String], isArray: true, description: 'Array of category IDs' })
  @ApiQuery({ name: 'vendorId', required: false, description: 'Filter by vendor ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], description: 'Filter by status' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price' })
  @ApiQuery({ name: 'minStock', required: false, description: 'Minimum stock' })
  @ApiQuery({ name: 'maxStock', required: false, description: 'Maximum stock' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default: 0)' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  async getArticles(@Query() query: any, @Headers() headers: Record<string, string>) {
    // Build query string from all query parameters
    const queryParams = new URLSearchParams();
    Object.keys(query).forEach(key => {
      const value = query[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // Handle array parameters (e.g., categoryIds[])
          value.forEach((item: any) => {
            queryParams.append(key, String(item));
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    const queryString = queryParams.toString();
    const path = queryString ? `/articles?${queryString}` : '/articles';
    return this.gatewayService.forwardRequest(path, 'GET', null, headers);
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
    return this.gatewayService.forwardRequest('/articles', 'POST', body, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'PUT', body, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'PATCH', body, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/articles/${id}`, 'DELETE', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/articles/${id}/activate`, 'PATCH', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/articles/${id}/deactivate`, 'PATCH', null, headers, req.user, false, false, (req as any).cookies);
  }

  @ApiTags('articles')
  @Post('articles/:id/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload single image to article', description: 'Upload a single image and add it to the article\'s images array. Requires ADMIN or VENDEUR role.' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({ status: 200, description: 'Image uploaded and added to article successfully' })
  @ApiResponse({ status: 400, description: 'Article not found or invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' })
  async uploadArticleImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const formData = new FormData();
    formData.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const multipartHeaders = {
      ...headers,
      ...formData.getHeaders(),
    };

    return this.gatewayService.forwardRequest(
      `/articles/${id}/images`,
      'POST',
      formData,
      multipartHeaders,
      req.user,
      true, // isMultipart
      false,
      (req as any).cookies,
    );
  }

  @ApiTags('articles')
  @Post('articles/:id/images/multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload multiple images to article', description: 'Upload multiple images (max 10) and add them to the article\'s images array. Requires ADMIN or VENDEUR role.' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['images'],
    },
  })
  @ApiResponse({ status: 200, description: 'Images uploaded and added to article successfully' })
  @ApiResponse({ status: 400, description: 'Article not found or invalid files' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' })
  async uploadMultipleArticleImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const multipartHeaders = {
      ...headers,
      ...formData.getHeaders(),
    };

    return this.gatewayService.forwardRequest(
      `/articles/${id}/images/multiple`,
      'POST',
      formData,
      multipartHeaders,
      req.user,
      true, // isMultipart
      false,
      (req as any).cookies,
    );
  }

  @ApiTags('articles')
  @Delete('articles/:id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove image from article', description: 'Remove an image URL from the article\'s images array. Requires ADMIN or VENDEUR role.' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiQuery({ name: 'imageUrl', description: 'Image URL to remove', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Image removed from article successfully' })
  @ApiResponse({ status: 400, description: 'Article not found or imageUrl parameter missing' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' })
  async removeArticleImage(
    @Param('id') id: string,
    @Query('imageUrl') imageUrl: string,
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    if (!imageUrl) {
      throw new BadRequestException('imageUrl query parameter is required');
    }

    return this.gatewayService.forwardRequest(
      `/articles/${id}/images?imageUrl=${encodeURIComponent(imageUrl)}`,
      'DELETE',
      null,
      headers,
      req.user,
    );
  }

  // ==================== Category Service Routes ====================
  @ApiTags('categories')
  @Get('categories')
  @ApiOperation({ 
    summary: 'List categories',
    description: 'Get list of all categories (flat list)'
  })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories(@Query() query: any, @Headers() headers: Record<string, string>) {
    const queryString = query.includeInactive ? `?includeInactive=${query.includeInactive}` : '';
    return this.gatewayService.forwardRequest(`/categories${queryString}`, 'GET', null, headers);
  }

  @ApiTags('categories')
  @Get('categories/tree')
  @ApiOperation({ 
    summary: 'Get category tree',
    description: 'Get hierarchical tree structure of categories'
  })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive categories' })
  @ApiResponse({ status: 200, description: 'Category tree retrieved successfully' })
  async getCategoryTree(@Query() query: any, @Headers() headers: Record<string, string>) {
    const queryString = query.includeInactive ? `?includeInactive=${query.includeInactive}` : '';
    return this.gatewayService.forwardRequest(`/categories/tree${queryString}`, 'GET', null, headers);
  }

  @ApiTags('categories')
  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryById(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    return this.gatewayService.forwardRequest(`/categories/${id}`, 'GET', null, headers);
  }

  @ApiTags('categories')
  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiBody({ description: 'Category data', schema: { type: 'object' } })
  async createCategory(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest('/categories', 'POST', body, headers, req.user, false, false, (req as any).cookies);
  }

  @ApiTags('categories')
  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiBody({ description: 'Category update data', schema: { type: 'object' } })
  async updateCategory(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/categories/${id}`, 'PATCH', body, headers, req.user, false, false, (req as any).cookies);
  }

  @ApiTags('categories')
  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: Request) {
    return this.gatewayService.forwardRequest(`/categories/${id}`, 'DELETE', null, headers, req.user, false, false, (req as any).cookies);
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
  @ApiQuery({ name: 'vendorId', required: true, description: 'Filter by vendor ID (required)' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default: 0)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrders(@Query() query: any, @Headers() headers: Record<string, string>, @Req() req: any) {
    // Build query string from query parameters
    const queryParams = new URLSearchParams();
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined && query[key] !== null) {
        queryParams.append(key, String(query[key]));
      }
    });
    const queryString = queryParams.toString();
    const path = queryString ? `/orders?${queryString}` : '/orders';
    return this.gatewayService.forwardRequest(path, 'GET', null, headers, req.user, false, false, req.cookies);
  }

  @ApiTags('orders')
  @Post('orders')
  // Remove @UseGuards(JwtAuthGuard) and @ApiBearerAuth to allow guest orders
  @ApiOperation({ summary: 'Create order (guest allowed)', description: 'Create a new order. Guest users can place orders without authentication.' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation errors' })
  @ApiBody({ description: 'Order data', schema: { type: 'object' } })
  async createOrder(@Body() body: any, @Headers() headers: Record<string, string>, @Req() req: Request) {
    // Pass req.user only if it exists (authenticated user), otherwise pass undefined for guest orders
    return this.gatewayService.forwardRequest('/orders', 'POST', body, headers, req.user, false, false, (req as any).cookies);
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
  async getOrder(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: any) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'GET', null, headers, req.user, false, false, req.cookies);
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
  async updateOrder(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'PATCH', body, headers, req.user, false, false, req.cookies);  // Changed from 'PUT' to 'PATCH'
  }

  @ApiTags('orders')
  @Patch('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Patch order', description: 'Partially update an existing order (e.g., status, isPaid). Requires ADMIN, VENDEUR, or CONFERMATEUR role.' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiBody({ description: 'Partial order update data', schema: { type: 'object' } })
  async patchOrder(@Param('id') id: string, @Body() body: any, @Headers() headers: Record<string, string>, @Req() req: any) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'PATCH', body, headers, req.user, false, false, req.cookies);
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
  async deleteOrder(@Param('id') id: string, @Headers() headers: Record<string, string>, @Req() req: any) {
    return this.gatewayService.forwardRequest(`/orders/${id}`, 'DELETE', null, headers, req.user, false, false, req.cookies);
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idvendor: {
          type: 'string',
          format: 'uuid',
          description: 'Vendor ID (optional - will use JWT token vendorId if not provided)'
        },
        notes: {
          type: 'string',
          description: 'Optional notes to attach when confirming the order'
        }
      },
      required: []
    }
  })
  @ApiResponse({ status: 200, description: 'Order confirmed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires VENDEUR or CONFERMATEUR role, or no remaining confirmations' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async confirmOrder(
    @Param('id') id: string,
    @Body() body: { idvendor?: string; notes?: string },
    @Headers() headers: Record<string, string>,
    @Req() req: any
  ) {
    // Map idvendor to vendorId for consistency with internal API
    const requestBody: any = {};
    if (body?.idvendor) {
      requestBody.vendorId = body.idvendor;
    }
    if (body?.notes !== undefined) {
      requestBody.notes = body.notes;
    }
    return this.gatewayService.forwardRequest(`/orders/${id}/confirm`, 'PATCH', Object.keys(requestBody).length > 0 ? requestBody : null, headers, req.user, false, false, req.cookies);
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
    return this.gatewayService.forwardRequest(`/orders/${id}/activate`, 'PATCH', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/orders/${id}/deactivate`, 'PATCH', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest('/profile', 'GET', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest('/profile', 'PUT', body, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest('/notifications', 'GET', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest(`/notifications/${id}/read`, 'PATCH', null, headers, req.user, false, false, (req as any).cookies);
  }

  @ApiTags('notifications')
  @Post('notifications/email/password-reset')
  @ApiOperation({ summary: 'Send password reset email', description: 'Sends a password reset email to the specified user' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  async sendPasswordResetEmail(@Body() body: any, @Headers() headers: Record<string, string> = {}) {
    return this.gatewayService.forwardRequest('/notifications/email/password-reset', 'POST', body, headers);
  }

  @ApiTags('notifications')
  @Post('notifications/email/welcome')
  @ApiOperation({ summary: 'Send welcome email', description: 'Sends a welcome email to a new user' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  async sendWelcomeEmail(@Body() body: any, @Headers() headers: Record<string, string> = {}) {
    return this.gatewayService.forwardRequest('/notifications/email/welcome', 'POST', body, headers);
  }

  @ApiTags('notifications')
  @Post('notifications/email/confermateur-assignment-request')
  @ApiOperation({ 
    summary: 'Send confermateur assignment request email', 
    description: 'Sends an email to a confermateur with accept/refuse links for a vendeur assignment request' 
  })
  @ApiResponse({ status: 200, description: 'Assignment request email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  async sendConfermateurAssignmentRequestEmail(@Body() body: any, @Headers() headers: Record<string, string> = {}) {
    return this.gatewayService.forwardRequest('/notifications/email/confermateur-assignment-request', 'POST', body, headers);
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
    return this.gatewayService.forwardRequest('/stats/users', 'GET', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest('/stats/orders', 'GET', null, headers, req.user, false, false, (req as any).cookies);
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
    return this.gatewayService.forwardRequest('/stats/articles', 'GET', null, headers, req.user, false, false, (req as any).cookies);
  }

}
