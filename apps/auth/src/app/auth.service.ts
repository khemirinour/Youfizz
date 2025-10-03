import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { User, UserRole } from '../entities/user.entity';
import { RefreshToken as RefreshTokenEntity } from '../entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  // Map of confermateur userId -> set of vendeur userIds they manage (temp until relation is added in persistence layer)
  private confermateurVendeurs: Map<string, Set<string>> = new Map();
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshTokenEntity) private readonly refreshRepo: Repository<RefreshTokenEntity>,
  ) {}
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  private readonly refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
  private readonly accessTokenExpiry = '15m'; // 15 minutes
  private readonly refreshTokenExpiry = '7d'; // 7 days

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepo.findOne({ where: { email: createUserDto.email } });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = this.userRepo.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName || null,
      lastName: createUserDto.lastName || null,
      role: createUserDto.role || UserRole.GUEST,
      isActive: true,
    });
    const saved = await this.userRepo.save(user);
    return this.toUserResponseDto(saved);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOne({ where: { email: loginDto.email } });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, (user as any).password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
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
    await this.refreshRepo.save(
      this.refreshRepo.create({
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
        isActive: true,
      }),
    );

    // Calculate access token expiry in seconds
    const accessTokenExpirySeconds = 15 * 60; // 15 minutes

    return {
      user: this.toUserResponseDto(user),
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenExpirySeconds
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    // Check if refresh token exists and is valid
    const tokenData = await this.refreshRepo.findOne({ where: { token: refreshToken, isActive: true } });
    
    if (!tokenData || !tokenData.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token is expired
    if (new Date() > tokenData.expiresAt) {
      await this.refreshRepo.delete({ token: refreshToken });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Find user
    const user = await this.userRepo.findOne({ where: { id: tokenData.userId } });
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
    await this.refreshRepo.delete({ token: refreshToken });
    await this.refreshRepo.save(
      this.refreshRepo.create({
        token: newRefreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
        isActive: true,
      }),
    );

    // Calculate access token expiry in seconds
    const accessTokenExpirySeconds = 15 * 60; // 15 minutes

    return {
      user: this.toUserResponseDto(user),
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenExpirySeconds
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    // Invalidate refresh token
    await this.refreshRepo.delete({ token: refreshToken });

    return { message: 'Successfully logged out' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    // Invalidate all refresh tokens for user
    await this.refreshRepo.delete({ userId });

    return { message: 'Successfully logged out from all devices' };
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find();
    return users.map(u => this.toUserResponseDto(u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.toUserResponseDto(user);
  }

  async findByRole(role: UserRole): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find({ where: { role } });
    return users.map(u => this.toUserResponseDto(u));
  }

  // Clean up expired refresh tokens (call this periodically)
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.refreshRepo.delete({ expiresAt: (null as any) }); // placeholder when using query builder
  }

  private toUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Admin management
  async updateUserRole(id: string, role: UserRole): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.role = role;
    await this.userRepo.save(user);
    return this.toUserResponseDto(user);
  }

  async setUserActive(id: string, isActive: boolean): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.isActive = isActive;
    await this.userRepo.save(user);
    return this.toUserResponseDto(user);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const removed = user;
    await this.userRepo.delete({ id });
    // Cleanup associations where this user was confermateur
    this.confermateurVendeurs.delete(removed.id);
    // Cleanup associations where this user was a vendeur
    for (const [confId, vSet] of this.confermateurVendeurs.entries()) {
      if (vSet.has(removed.id)) {
        vSet.delete(removed.id);
        this.confermateurVendeurs.set(confId, vSet);
      }
    }
    return { message: 'User deleted' };
  }

  // Confermateur management for vendeurs
  async findConfermateurs(): Promise<UserResponseDto[]> {
    return this.findByRole(UserRole.CONFERMATEUR);
  }

  async assignVendeurToConfermateur(confermateurId: string, vendeurId: string): Promise<{ message: string }> {
    const confermateur = await this.userRepo.findOne({ where: { id: confermateurId, role: UserRole.CONFERMATEUR } });
    if (!confermateur) {
      throw new BadRequestException('Confermateur not found');
    }
    const vendeur = await this.userRepo.findOne({ where: { id: vendeurId, role: UserRole.VENDEUR } });
    if (!vendeur) {
      throw new BadRequestException('Vendeur not found');
    }
    const set = this.confermateurVendeurs.get(confermateurId) || new Set<string>();
    set.add(vendeurId);
    this.confermateurVendeurs.set(confermateurId, set);
    return { message: 'Vendeur assigned to confermateur' };
  }

  async unassignVendeurFromConfermateur(confermateurId: string, vendeurId: string): Promise<{ message: string }> {
    const set = this.confermateurVendeurs.get(confermateurId);
    if (!set) {
      return { message: 'No association existed' };
    }
    set.delete(vendeurId);
    this.confermateurVendeurs.set(confermateurId, set);
    return { message: 'Vendeur unassigned from confermateur' };
  }

  async getConfermateursForVendeur(vendeurId: string): Promise<UserResponseDto[]> {
    const result: UserResponseDto[] = [];
    for (const [confId, vSet] of this.confermateurVendeurs.entries()) {
      if (vSet.has(vendeurId)) {
        const user = await this.userRepo.findOne({ where: { id: confId } });
        if (user) result.push(this.toUserResponseDto(user));
      }
    }
    return result;
  }
}
