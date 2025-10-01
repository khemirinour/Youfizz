import { Controller, Get, Post, Body, Param, ValidationPipe, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UserRole } from '../entities/user.entity';

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
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
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

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  async findAll(@Query('role') role?: UserRole): Promise<UserResponseDto[]> {
    if (role) {
      return this.authService.findByRole(role);
    }
    return this.authService.findAll();
  }

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
        [UserRole.COFERMATEUR]: 'Confirmation access',
        [UserRole.GUEST]: 'Limited access, no authentication required'
      }
    };
  }
}
