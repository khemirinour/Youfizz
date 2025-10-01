import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private users: UserResponseDto[] = [];
  private refreshTokens: Map<string, { userId: string; expiresAt: Date; isActive: boolean }> = new Map();
  private nextId = 1;
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  private readonly refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
  private readonly accessTokenExpiry = '15m'; // 15 minutes
  private readonly refreshTokenExpiry = '7d'; // 7 days

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = this.users.find(user => user.email === createUserDto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user: UserResponseDto = {
      id: this.nextId.toString(),
      email: createUserDto.email,
      firstName: createUserDto.firstName || '',
      lastName: createUserDto.lastName || '',
      role: createUserDto.role || UserRole.GUEST,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);
    this.nextId++;

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = this.users.find(u => u.email === loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In a real app, you'd verify the password from the database
    // For now, we'll just check if user exists and is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate access token
    const accessTokenPayload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      type: 'access'
    };
    const accessToken = jwt.sign(accessTokenPayload, this.jwtSecret, { expiresIn: this.accessTokenExpiry });

    // Generate refresh token
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    // Store refresh token
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: refreshTokenExpiry,
      isActive: true
    });

    // Calculate access token expiry in seconds
    const accessTokenExpirySeconds = 15 * 60; // 15 minutes

    return {
      user,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenExpirySeconds
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    // Check if refresh token exists and is valid
    const tokenData = this.refreshTokens.get(refreshToken);
    
    if (!tokenData || !tokenData.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token is expired
    if (new Date() > tokenData.expiresAt) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Find user
    const user = this.users.find(u => u.id === tokenData.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new access token
    const accessTokenPayload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      type: 'access'
    };
    const accessToken = jwt.sign(accessTokenPayload, this.jwtSecret, { expiresIn: this.accessTokenExpiry });

    // Generate new refresh token (rotate refresh token)
    const newRefreshToken = this.generateRefreshToken();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    // Remove old refresh token and add new one
    this.refreshTokens.delete(refreshToken);
    this.refreshTokens.set(newRefreshToken, {
      userId: user.id,
      expiresAt: refreshTokenExpiry,
      isActive: true
    });

    // Calculate access token expiry in seconds
    const accessTokenExpirySeconds = 15 * 60; // 15 minutes

    return {
      user,
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenExpirySeconds
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    // Invalidate refresh token
    if (this.refreshTokens.has(refreshToken)) {
      this.refreshTokens.delete(refreshToken);
    }

    return { message: 'Successfully logged out' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    // Invalidate all refresh tokens for user
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.userId === userId) {
        this.refreshTokens.delete(token);
      }
    }

    return { message: 'Successfully logged out from all devices' };
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  async findAll(): Promise<UserResponseDto[]> {
    return this.users;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = this.users.find(user => user.id === id);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async findByRole(role: UserRole): Promise<UserResponseDto[]> {
    return this.users.filter(user => user.role === role);
  }

  // Clean up expired refresh tokens (call this periodically)
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    for (const [token, data] of this.refreshTokens.entries()) {
      if (now > data.expiresAt) {
        this.refreshTokens.delete(token);
      }
    }
  }
}
