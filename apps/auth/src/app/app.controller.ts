import { Controller, Get, Post, Body, Param, ValidationPipe, Query, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
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
}
