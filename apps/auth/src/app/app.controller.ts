import { Controller, Get, Post, Body, Param, ValidationPipe, Query, Patch, Delete, UseGuards, Req, Res, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiConflictResponse, ApiTooManyRequestsResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { getApiGatewayUrl } from '@you-fizz/shared';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { PasswordResetResponseDto } from '../dto/password-reset-response.dto';
import { ConfirmPasswordResetDto } from '../dto/confirm-password-reset.dto';
import { PasswordResetConfirmationResponseDto } from '../dto/password-reset-confirmation-response.dto';
import { UserRole } from '../entities/user.entity';
import { ListUsersQuery } from '../dto/list-users.query';
import { Paginated } from '../dto/paginated.dto';
import { JwtAuthGuard } from '@you-fizz/shared';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('auth')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiOkResponse({ 
    description: 'Welcome message',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Hello API!' }
      }
    }
  })
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ 
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        service: { type: 'string', example: 'auth' }
      }
    }
  })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth',
    };
  }

  @Post('register')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 registrations per minute
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account in the system. The user will receive a welcome email upon successful registration.'
  })
  @ApiCreatedResponse({ 
    description: 'User successfully registered', 
    type: UserResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation errors',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['email must be a valid email address', 'password must be at least 8 characters long']
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiConflictResponse({ 
    description: 'User already exists',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User with this email already exists' },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  @ApiTooManyRequestsResponse({ 
    description: 'Too many requests - rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Too many registration attempts. Please wait before trying again.' },
        statusCode: { type: 'number', example: 429 },
        retryAfter: { type: 'number', example: 60 }
      }
    }
  })
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 login attempts per minute
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticate user with email and password to receive access and refresh tokens.'
  })
  @ApiOkResponse({ 
    description: 'Login successful', 
    type: AuthResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation errors'
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid email or password' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  @ApiTooManyRequestsResponse({ 
    description: 'Too many requests - rate limit exceeded'
  })
  async login(@Body(ValidationPipe) loginDto: LoginDto, @Res({ passthrough: true }) response: any): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto, response);
    return result;
  }

  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Generate new access token using valid refresh token.'
  })
  @ApiOkResponse({ 
    description: 'Token refreshed successfully', 
    type: AuthResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation errors'
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid refresh token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid refresh token' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 }
      }
    }
  })
  async refreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto, @Req() request: any, @Res({ passthrough: true }) response: any): Promise<AuthResponseDto> {
    // Try to get refresh token from cookie first, fallback to body
    // Check both parsed cookies and Cookie header (for gateway forwarding)
    const cookieRefreshToken = request.cookies?.refreshToken;
    const headerCookie = request.headers?.cookie;
    
    // Parse Cookie header if cookies object doesn't have refreshToken
    let refreshToken = cookieRefreshToken;
    if (!refreshToken && headerCookie) {
      const cookies = headerCookie.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});
      refreshToken = cookies.refreshToken;
    }
    
    // Fallback to body if not in cookies
    if (!refreshToken && refreshTokenDto?.refreshToken && refreshTokenDto.refreshToken.trim()) {
      refreshToken = refreshTokenDto.refreshToken;
    }
    
    const result = await this.authService.refreshToken(refreshTokenDto, response, refreshToken);
    return result;
  }

  @Post('logout')
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Invalidate refresh token to log out user from current session.'
  })
  @ApiOkResponse({ 
    description: 'Successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Successfully logged out' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation errors'
  })
  async logout(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto, @Req() request: any, @Res({ passthrough: true }) response: any): Promise<{ message: string }> {
    // Try to get refresh token from cookie first, fallback to body
    const refreshToken = request.cookies?.refreshToken || refreshTokenDto?.refreshToken;
    if (!refreshToken) {
      // If no refresh token in cookie or body, still clear cookies
      if (response) {
        response.clearCookie('accessToken', { path: '/' });
        response.clearCookie('refreshToken', { path: '/' });
      }
      return { message: 'Successfully logged out' };
    }
    const result = await this.authService.logout(refreshToken, response);
    return result;
  }

  @Post('logout-all')
  @ApiOperation({ 
    summary: 'Logout from all devices',
    description: 'Invalidate all refresh tokens for a user to log out from all devices.'
  })
  @ApiOkResponse({ 
    description: 'Successfully logged out from all devices',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Successfully logged out from all devices' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation errors'
  })
  async logoutAll(@Body() body: { userId: string }, @Res({ passthrough: true }) response: any): Promise<{ message: string }> {
    const result = await this.authService.logoutAll(body.userId, response);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('users')
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieve list of all users. Admin only. Can filter by role.'
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filter users by role' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'number', default: 1 } })
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'number', default: 10 } })
  @ApiOkResponse({ 
    description: 'List of users', 
    type: [UserResponseDto]
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async findAll(@Query() query: ListUsersQuery): Promise<Paginated<UserResponseDto>> {
    const { role, page, limit } = query;
    return this.authService.findAllPaginated({ role, page, limit });
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/by-email/:email')
  @ApiOperation({
    summary: 'Find user by email',
    description: 'Find a user by email address. Optionally filter by role using query parameter.'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filter by user role' })
  @ApiOkResponse({ description: 'User found', type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async findUserByEmail(
    @Param('email') email: string,
    @Query('role') role?: UserRole,
  ) {
    // Explicitly decode the email parameter (NestJS might not decode it automatically)
    // Handle both encoded and already-decoded emails
    let decodedEmail: string;
    try {
      decodedEmail = decodeURIComponent(email).trim();
    } catch (e) {
      // If decoding fails, use the email as-is (might already be decoded)
      decodedEmail = email.trim();
    }
    
    const user = await this.authService.findUserByEmail(decodedEmail, role);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve specific user by ID. Admin can access any user, regular users can only access their own profile.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'User found', 
    type: UserResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid user ID format'
  })
  @ApiNotFoundResponse({ 
    description: 'User not found'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async findOne(@Param('id') id: string, @Req() req: any): Promise<UserResponseDto> {
    const currentUser = req.user;
    
    // Allow if user is admin OR if user is accessing their own profile
    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    
    return this.authService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Update user profile information (firstName, lastName, email). Admin can update any user, regular users can only update their own profile. Role cannot be updated via this endpoint.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'User updated successfully', 
    type: UserResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid user ID or email already taken'
  })
  @ApiNotFoundResponse({ 
    description: 'User not found'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateData: UpdateUserDto,
    @Req() req: any
  ): Promise<UserResponseDto> {
    const currentUser = req.user;
    
    // Allow if user is admin OR if user is updating their own profile
    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Prevent role updates via this endpoint
    if ((updateData as any).role) {
      throw new ForbiddenException('Role cannot be updated via this endpoint');
    }

    return this.authService.updateUserProfile(id, updateData);
  }

  @Get('roles')
  @ApiOperation({ 
    summary: 'Get available roles',
    description: 'Retrieve list of available user roles and their descriptions.'
  })
  @ApiOkResponse({ 
    description: 'Available roles',
    schema: {
      type: 'object',
      properties: {
        roles: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['ADMIN', 'VENDEUR', 'CONFERMATEUR', 'GUEST']
        },
        description: {
          type: 'object',
          properties: {
            ADMIN: { type: 'string', example: 'Full system access' },
            VENDEUR: { type: 'string', example: 'Sales management access' },
            CONFERMATEUR: { type: 'string', example: 'Confirmation access' },
            GUEST: { type: 'string', example: 'Limited access, no authentication required' }
          }
        }
      }
    }
  })
  getRoles() {
    return {
      roles: Object.values(UserRole),
      description: {
        [UserRole.ADMIN]: 'Full system access',
        [UserRole.VENDEUR]: 'Sales management access',
        [UserRole.CONFERMATEUR]: 'Confirmation access',
        [UserRole.GUEST]: 'Limited access, no authentication required'
      }
    };
  }

  // Admin: manage users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('users/:id/role/:role')
  @ApiOperation({ 
    summary: 'Admin: update user role',
    description: 'Update user role. Admin only.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'User role updated successfully',
    type: UserResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid user ID or role'
  })
  @ApiNotFoundResponse({ 
    description: 'User not found'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async updateUserRole(@Param('id') id: string, @Param('role') role: UserRole) {
    return this.authService.updateUserRole(id, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('users/:id/active')
  @ApiOperation({ 
    summary: 'Admin: activate/deactivate user',
    description: 'Activate or deactivate user account. Admin only.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'User status updated successfully',
    type: UserResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid user ID or status'
  })
  @ApiNotFoundResponse({ 
    description: 'User not found'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async setUserActive(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.authService.setUserActive(id, body.isActive);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('users/:id')
  @ApiOperation({ 
    summary: 'Admin: delete user',
    description: 'Delete user account permanently. Admin only.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deleted successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid user ID'
  })
  @ApiNotFoundResponse({ 
    description: 'User not found'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('users/:id/vendeur/nbr-cmd-conf')
  @ApiOperation({ 
    summary: 'Admin: increment vendeur nbrCmdConf',
    description: 'Increment the nbrCmdConf value for a vendeur by user ID. Admin only.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'Vendeur nbrCmdConf incremented successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Vendeur ID' },
        idUser: { type: 'string', format: 'uuid', description: 'User ID' },
        nbrCmdConf: { type: 'number', description: 'Updated nbrCmdConf value' }
      },
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        idUser: '123e4567-e89b-12d3-a456-426614174001',
        nbrCmdConf: 11
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid user ID or vendeur not found for this user'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async incrementVendeurNbrCmdConf(
    @Param('id') id: string,
    @Body() body: { amount?: number }
  ) {
    const amount = body?.amount ?? 1;
    return this.authService.incrementVendeurNbrCmdConf(id, amount);
  }

  // Vendor: Request confermateur assignment
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDEUR)
  @Post('vendeurs/:vendeurId/request-confermateur')
  @ApiOperation({
    summary: 'Request confermateur assignment',
    description: 'Send an email request to a confermateur to become assigned to this vendor. Vendor can only request for themselves.'
  })
  @ApiBearerAuth()
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
  @ApiCreatedResponse({ description: 'Assignment request email sent successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request or confermateur not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Vendeur required' })
  async requestConfermateurAssignment(
    @Param('vendeurId') vendeurId: string,
    @Body('confermateurEmail') confermateurEmail: string,
    @Req() req: any,
  ) {
    // Validate that vendor is requesting for themselves
    // JWT strategy returns userId (from payload.sub), not sub
    if (req.user?.userId !== vendeurId) {
      throw new ForbiddenException('You can only request assignment for yourself');
    }
    return this.authService.sendConfermateurAssignmentRequest(vendeurId, confermateurEmail);
  }

  // Get vendeur entity by user ID
  @Get('vendeurs/user/:userId')
  @ApiOperation({
    summary: 'Get vendeur entity by user ID',
    description: 'Retrieve vendeur entity information for a given user ID. Returns vendeur entity with user relation.'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({ description: 'Vendeur entity retrieved successfully' })
  @ApiBadRequestResponse({ description: 'Vendeur entity not found for this user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getVendeurByUserId(@Param('userId') userId: string) {
    return this.authService.getVendeurByUserId(userId);
  }

  // Vendeur: manage confermateurs associations
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDEUR, UserRole.ADMIN)
  @Get('vendeurs/:vendeurId/confermateurs')
  @ApiOperation({ 
    summary: 'Get confermateurs assigned to a vendeur',
    description: 'Retrieve list of confermateurs assigned to a specific vendeur.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'Confermateurs retrieved successfully'
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid vendeur ID'
  })
  @ApiNotFoundResponse({ 
    description: 'Vendeur not found'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Vendeur or Admin required' })
  async getConfermateursForVendeur(@Param('vendeurId') vendeurId: string) {
    return this.authService.getConfermateursForVendeur(vendeurId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDEUR)
  @Delete('vendeurs/:vendeurId/confermateurs/:confermateurId')
  @ApiOperation({
    summary: 'Vendor: remove confermateur association',
    description: 'Allow a vendor to remove/unassign an associated confermateur from themselves.',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'vendeurId', description: 'Vendeur user ID' })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiOkResponse({ description: 'Association removed (or no association existed)' })
  @ApiBadRequestResponse({ description: 'Invalid confermateur or vendeur ID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Vendeur required or cannot modify another vendor' })
  async removeConfermateurForVendeur(
    @Param('vendeurId') vendeurId: string,
    @Param('confermateurId') confermateurId: string,
    @Req() req: any,
  ) {
    if (req.user?.userId !== vendeurId) {
      throw new ForbiddenException('You can only manage your own confermateur associations');
    }
    // Reuse existing unassign logic (expects confermateurId as first arg, vendeurId as second)
    return this.authService.unassignVendeurFromConfermateur(confermateurId, vendeurId);
  }

  // Get confermateur entity by user ID
  
  @Get('confermateurs/user/:userId')
  @ApiOperation({
    summary: 'Get confermateur entity by user ID',
    description: 'Retrieve confermateur entity information for a given user ID. Returns confermateur entity with vendeurs and user relations.'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({ description: 'Confermateur entity retrieved successfully' })
  @ApiBadRequestResponse({ description: 'Confermateur entity not found for this user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async getConfermateurByUserId(@Param('userId') userId: string) {
    return this.authService.getConfermateurByUserId(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONFERMATEUR)
  @Get('confermateurs/:confermateurId/vendeurs')
  @ApiOperation({
    summary: 'Get vendors assigned to a confermateur',
    description: 'Retrieve list of vendor users assigned to the authenticated confermateur.',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiOkResponse({ description: 'Vendeurs retrieved successfully' })
  @ApiBadRequestResponse({ description: 'Invalid confermateur ID' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Confermateur required or cannot view another confermateur' })
  async getVendeursForConfermateur(
    @Param('confermateurId') confermateurId: string,
    @Req() req: any,
  ) {
    if (req.user?.userId !== confermateurId) {
      throw new ForbiddenException('You can only view your own vendors');
    }
    return this.authService.getVendeursForConfermateur(confermateurId);
  }

  // Admin/Vendeur: list confermateurs
  @UseGuards(JwtAuthGuard)
  @Get('confermateurs')
  @ApiOperation({ 
    summary: 'List all confermateurs',
    description: 'Retrieve list of all confermateurs in the system.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'Confermateurs retrieved successfully'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async findConfermateurs() {
    return this.authService.findConfermateurs();
  }

  // Admin: manage assignment between confermateur and vendeur
  // Public: Accept assignment request (via email link)
  @Get('confermateurs/:confermateurId/accept-vendeur/:vendeurId')
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

  @Post('confermateurs/:confermateurId/accept-vendeur/:vendeurId')
  @ApiOperation({
    summary: 'Accept vendeur assignment request',
    description: 'Accept a vendeur assignment request. This endpoint is public and accessed via email link.'
  })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur user ID' })
  @ApiOkResponse({ description: 'Assignment accepted successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request or assignment failed' })
  async acceptVendeurAssignment(
    @Param('confermateurId') confermateurId: string,
    @Param('vendeurId') vendeurId: string,
    @Res() res: any
  ) {
    try {
      await this.authService.assignVendeurToConfermateur(confermateurId, vendeurId);
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Assignment Accepted</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .success-icon { color: #28a745; font-size: 48px; margin: 20px 0; }
              h2 { color: #28a745; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">✓</div>
              <h2>Assignment Accepted Successfully!</h2>
              <p>The vendeur has been assigned to you.</p>
              <p style="color: #666; font-size: 14px;">This window will close automatically...</p>
            </div>
            <script>
              setTimeout(function() {
                window.close();
              }, 2000);
            </script>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .error-icon { color: #dc3545; font-size: 48px; margin: 20px 0; }
              h2 { color: #dc3545; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">✗</div>
              <h2>Error</h2>
              <p>${error.message || 'Failed to accept assignment'}</p>
            </div>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.status(400).send(html);
    }
  }

  // Public: Refuse assignment request (via email link)
  @Get('confermateurs/:confermateurId/refuse-vendeur/:vendeurId')
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

  @Post('confermateurs/:confermateurId/refuse-vendeur/:vendeurId')
  @ApiOperation({
    summary: 'Refuse vendeur assignment request',
    description: 'Refuse a vendeur assignment request. This endpoint is public and accessed via email link.'
  })
  @ApiParam({ name: 'confermateurId', description: 'Confermateur user ID' })
  @ApiParam({ name: 'vendeurId', description: 'Vendeur user ID' })
  @ApiOkResponse({ description: 'Assignment request refused successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  async refuseVendeurAssignment(
    @Param('confermateurId') confermateurId: string,
    @Param('vendeurId') vendeurId: string,
    @Res() res: any
  ) {
    try {
      await this.authService.refuseVendeurAssignment(confermateurId, vendeurId);
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Assignment Refused</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .info-icon { color: #ffc107; font-size: 48px; margin: 20px 0; }
              h2 { color: #333; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="info-icon">ℹ</div>
              <h2>Assignment Refused</h2>
              <p>The assignment request has been refused.</p>
              <p style="color: #666; font-size: 14px;">This window will close automatically...</p>
            </div>
            <script>
              setTimeout(function() {
                window.close();
              }, 2000);
            </script>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .error-icon { color: #dc3545; font-size: 48px; margin: 20px 0; }
              h2 { color: #dc3545; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">✗</div>
              <h2>Error</h2>
              <p>${error.message || 'Failed to refuse assignment'}</p>
            </div>
          </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.status(400).send(html);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('confermateurs/:confermateurId/vendeurs/:vendeurId')
  @ApiOperation({ 
    summary: 'Assign vendeur to confermateur',
    description: 'Create assignment between confermateur and vendeur. Admin only.'
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ 
    description: 'Assignment created successfully'
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid confermateur or vendeur ID'
  })
  @ApiNotFoundResponse({ 
    description: 'Confermateur or vendeur not found'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async assignVendeurToConfermateur(
    @Param('confermateurId') confermateurId: string,
    @Param('vendeurId') vendeurId: string,
  ) {
    return this.authService.assignVendeurToConfermateur(confermateurId, vendeurId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('stats/users')
  @ApiOperation({ 
    summary: 'Admin: Get user statistics',
    description: 'Returns comprehensive statistics about users including total count, breakdown by role, active/inactive counts, and vendeurs with confirmed commands.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of users' },
        byRole: { 
          type: 'object', 
          description: 'Users count by role',
          additionalProperties: { type: 'number' },
          example: { admin: 5, vendeur: 10, confermateur: 3, guest: 20 }
        },
        active: { type: 'number', description: 'Number of active users' },
        inactive: { type: 'number', description: 'Number of inactive users' },
        vendeursWithCmdConf: { type: 'number', description: 'Number of vendeurs with nbrCmdConf > 0' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async getUserStats() {
    return this.authService.getUserStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('confermateurs/:confermateurId/vendeurs/:vendeurId')
  @ApiOperation({ 
    summary: 'Unassign vendeur from confermateur',
    description: 'Remove assignment between confermateur and vendeur. Admin only.'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ 
    description: 'Assignment removed successfully'
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid confermateur or vendeur ID'
  })
  @ApiNotFoundResponse({ 
    description: 'Assignment not found'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async unassignVendeurFromConfermateur(
    @Param('confermateurId') confermateurId: string,
    @Param('vendeurId') vendeurId: string,
  ) {
    return this.authService.unassignVendeurFromConfermateur(confermateurId, vendeurId);
  }

  // Password reset endpoints
  @Post('password-reset/request')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ short: { limit: 3, ttl: 300000 } }) // 3 password reset requests per 5 minutes
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send password reset email to user if account exists. Rate limited to prevent abuse.'
  })
  @ApiOkResponse({ 
    description: 'Password reset email sent (if account exists)', 
    type: PasswordResetResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation errors'
  })
  @ApiTooManyRequestsResponse({ 
    description: 'Too many requests - rate limit exceeded'
  })
  async requestPasswordReset(
    @Body(ValidationPipe) requestPasswordResetDto: RequestPasswordResetDto
  ): Promise<PasswordResetResponseDto> {
    return this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('password-reset/confirm')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ medium: { limit: 30, ttl: 10000 } }) // 30 token confirmations per 10 seconds (more lenient for page loads)
  @ApiOperation({ 
    summary: 'Confirm password reset token validity',
    description: 'Verify if password reset token is valid and not expired.'
  })
  @ApiOkResponse({ 
    description: 'Token validation result', 
    type: PasswordResetConfirmationResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - validation errors'
  })
  @ApiTooManyRequestsResponse({ 
    description: 'Too many requests - rate limit exceeded'
  })
  async confirmPasswordResetToken(
    @Body(ValidationPipe) confirmPasswordResetDto: ConfirmPasswordResetDto
  ): Promise<PasswordResetConfirmationResponseDto> {
    return this.authService.confirmPasswordResetToken(confirmPasswordResetDto.token);
  }

  @Post('password-reset/reset')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 300000 } }) // 5 password resets per 5 minutes
  @ApiOperation({ 
    summary: 'Reset password with token',
    description: 'Reset user password using valid reset token. Rate limited to prevent abuse.'
  })
  @ApiOkResponse({ 
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password has been reset successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid or expired token'
  })
  @ApiTooManyRequestsResponse({ 
    description: 'Too many requests - rate limit exceeded'
  })
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }
}
