import { Controller, Get, Post, Body, Param, ValidationPipe, Query, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
import { JwtAuthGuard } from './jwt-auth.guard';
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
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getData() {
    return this.appService.getData();
  }

  @Post('register')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 registrations per minute
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account in the system. The user will receive a welcome email upon successful registration.',
    tags: ['Authentication']
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered', 
    type: UserResponseDto,
    content: {
      'application/json': {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'GUEST',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User already exists',
    content: {
      'application/json': {
        example: {
          message: 'User with this email already exists',
          error: 'Conflict',
          statusCode: 409
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation errors',
    content: {
      'application/json': {
        example: {
          message: ['email must be a valid email address', 'password must be at least 8 characters long'],
          error: 'Bad Request',
          statusCode: 400
        }
      }
    }
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many requests - rate limit exceeded',
    content: {
      'application/json': {
        example: {
          message: 'Too many registration attempts. Please wait before trying again.',
          statusCode: 429,
          retryAfter: 60
        }
      }
    }
  })
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 login attempts per minute
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Post('logout-all')
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 200, description: 'Successfully logged out from all devices' })
  async logoutAll(@Body() body: { userId: string }): Promise<{ message: string }> {
    return this.authService.logoutAll(body.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  async findAll(@Query('role') role?: UserRole): Promise<UserResponseDto[]> {
    if (role) {
      return this.authService.findByRole(role);
    }
    return this.authService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.authService.findOne(id);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get available roles' })
  @ApiResponse({ status: 200, description: 'Available roles' })
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
  @ApiOperation({ summary: 'Admin: update user role' })
  async updateUserRole(@Param('id') id: string, @Param('role') role: UserRole) {
    return this.authService.updateUserRole(id, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('users/:id/active')
  @ApiOperation({ summary: 'Admin: activate/deactivate user' })
  async setUserActive(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.authService.setUserActive(id, body.isActive);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('users/:id')
  @ApiOperation({ summary: 'Admin: delete user' })
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  // Vendeur: manage confermateurs associations
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDEUR, UserRole.ADMIN)
  @Get('vendeurs/:vendeurId/confermateurs')
  @ApiOperation({ summary: 'Get confermateurs assigned to a vendeur' })
  async getConfermateursForVendeur(@Param('vendeurId') vendeurId: string) {
    return this.authService.getConfermateursForVendeur(vendeurId);
  }

  // Admin/Vendeur: list confermateurs
  @UseGuards(JwtAuthGuard)
  @Get('confermateurs')
  @ApiOperation({ summary: 'List all confermateurs' })
  async findConfermateurs() {
    return this.authService.findConfermateurs();
  }

  // Admin: manage assignment between confermateur and vendeur
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('confermateurs/:confermateurId/vendeurs/:vendeurId')
  @ApiOperation({ summary: 'Assign vendeur to confermateur' })
  async assignVendeurToConfermateur(
    @Param('confermateurId') confermateurId: string,
    @Param('vendeurId') vendeurId: string,
  ) {
    return this.authService.assignVendeurToConfermateur(confermateurId, vendeurId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('confermateurs/:confermateurId/vendeurs/:vendeurId')
  @ApiOperation({ summary: 'Unassign vendeur from confermateur' })
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
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset email sent (if account exists)', 
    type: PasswordResetResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async requestPasswordReset(
    @Body(ValidationPipe) requestPasswordResetDto: RequestPasswordResetDto
  ): Promise<PasswordResetResponseDto> {
    return this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('password-reset/confirm')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 token confirmations per minute
  @ApiOperation({ summary: 'Confirm password reset token validity' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token validation result', 
    type: PasswordResetConfirmationResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async confirmPasswordResetToken(
    @Body(ValidationPipe) confirmPasswordResetDto: ConfirmPasswordResetDto
  ): Promise<PasswordResetConfirmationResponseDto> {
    return this.authService.confirmPasswordResetToken(confirmPasswordResetDto.token);
  }

  @Post('password-reset/reset')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 300000 } }) // 5 password resets per 5 minutes
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password has been reset successfully' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }
}
