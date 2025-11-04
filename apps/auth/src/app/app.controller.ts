import { Controller, Get, Post, Body, Param, ValidationPipe, Query, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiConflictResponse, ApiTooManyRequestsResponse, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
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
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
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
  async refreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
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
  async logout(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    return this.authService.logout(refreshTokenDto.refreshToken);
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
  async logoutAll(@Body() body: { userId: string }): Promise<{ message: string }> {
    return this.authService.logoutAll(body.userId);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('users/:id')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve specific user by ID. Admin only.'
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
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.authService.findOne(id);
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
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 token confirmations per minute
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
