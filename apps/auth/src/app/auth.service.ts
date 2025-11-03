import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '@you-fizz/shared';
import { NotificationClient } from './notification.client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { User, UserRole } from '../entities/user.entity';
import { Vendeur } from '../entities/vendeur.entity';
import { RefreshToken as RefreshTokenEntity } from '../entities/refresh-token.entity';
import { Confermateur } from '../entities/confermateur.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  // Map of confermateur userId -> set of vendeur userIds they manage (temp until relation is added in persistence layer)
  private confermateurVendeurs: Map<string, Set<string>> = new Map();
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Vendeur) private readonly vendeurRepo: Repository<Vendeur>,
    @InjectRepository(RefreshTokenEntity) private readonly refreshRepo: Repository<RefreshTokenEntity>,
    @InjectRepository(Confermateur) private readonly confermateurRepo: Repository<Confermateur>,
    @InjectRepository(PasswordResetToken) private readonly passwordResetRepo: Repository<PasswordResetToken>,
    private readonly emailService: EmailService,
    private readonly notificationClient: NotificationClient,
    private readonly jwtService: JwtService,
  ) {}
  private readonly jwtSecret = (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Missing required environment variable JWT_SECRET');
    }
    return secret;
  })();
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

    if (saved.role === UserRole.VENDEUR) {
      const vendeur = this.vendeurRepo.create({
        user: saved,
        idUser: saved.id,
        nbrCmdConf: 10, // Default value
      });
      await this.vendeurRepo.save(vendeur);
    }
    
    // Send welcome email asynchronously (fire-and-forget)
    this.sendWelcomeEmailAsync(saved.email, saved.firstName);
    
    return this.toUserResponseDto(saved);
  }

  // Private method to send welcome email asynchronously
  private async sendWelcomeEmailAsync(email: string, firstName?: string): Promise<void> {
    try {
      await this.emailService.sendWelcomeEmail({ email, firstName });
      console.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      // Log error but don't fail the registration
      console.error(`Failed to send welcome email to ${email}:`, error.message);
    }
  }

  // Private method to send password reset email asynchronously
  private async sendPasswordResetEmailAsync(email: string, token: string, firstName?: string): Promise<void> {
    try {
      await this.emailService.sendPasswordResetEmail({ email, resetToken: token, firstName });
      console.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      // Log error but don't fail the request for security reasons
      console.error('Failed to send password reset email:', error.message);
      console.error('This may be due to email service being unavailable or misconfigured');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOne({ where: { email: loginDto.email } });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const passwordMatches = await user.validatePassword(loginDto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // If user has old password format (with separate salt), migrate to new format
    if (user.salt) {
      user.password = await bcrypt.hash(loginDto.password, 12);
      user.salt = null;
      user.passwordChangedAt = new Date();
      await this.userRepo.save(user);
    }

    // Get vendor/confirmateur IDs first
    const { vendorId, confirmateurId } = await this.getVendorAndConfirmateurIds(user.id);

    // Generate access token with vendor/confirmateur IDs
    const accessTokenPayload: any = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      type: 'access'
    };

    // Include vendor ID if user is a vendor
    if (user.role === UserRole.VENDEUR && vendorId) {
      accessTokenPayload.vendorId = vendorId;
    }

    // Include confirmateur ID if user is a confirmateur
    if (user.role === UserRole.CONFERMATEUR && confirmateurId) {
      accessTokenPayload.confirmateurId = confirmateurId;
    }

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, { secret: this.jwtSecret, expiresIn: this.accessTokenExpiry });

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
      expiresIn: accessTokenExpirySeconds,
      vendorId,
      confirmateurId
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

    // Get vendor/confirmateur IDs first
    const { vendorId, confirmateurId } = await this.getVendorAndConfirmateurIds(user.id);

    // Generate new access token with vendor/confirmateur IDs
    const accessTokenPayload: any = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      type: 'access'
    };

    // Include vendor ID if user is a vendor
    if (user.role === UserRole.VENDEUR && vendorId) {
      accessTokenPayload.vendorId = vendorId;
    }

    // Include confirmateur ID if user is a confirmateur
    if (user.role === UserRole.CONFERMATEUR && confirmateurId) {
      accessTokenPayload.confirmateurId = confirmateurId;
    }

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, { secret: this.jwtSecret, expiresIn: this.accessTokenExpiry });

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
      expiresIn: accessTokenExpirySeconds,
      vendorId,
      confirmateurId
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

  private async getVendorAndConfirmateurIds(userId: string): Promise<{ vendorId?: string; confirmateurId?: string }> {
    const [vendeur, confermateur] = await Promise.all([
      this.vendeurRepo.findOne({ where: { idUser: userId } }),
      this.confermateurRepo.findOne({ where: { idUser: userId } })
    ]);

    return {
      vendorId: vendeur?.id,
      confirmateurId: confermateur?.id
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find();
    return users.map(u => this.toUserResponseDto(u));
  }

  async findAllPaginated(params: { role?: UserRole; page: number; limit: number; }): Promise<{ items: (UserResponseDto & { nbrCmdConf?: number; vendeurs?: Array<{ id: string; firstName: string; lastName: string }> })[]; total: number; page: number; limit: number; }> {
    const { role, page, limit } = params;
    const where = role ? { role } as any : {};
    const [items, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const userDtos = items.map(u => this.toUserResponseDto(u));
    // Fetch vendeur data for VENDEUR users
    const vendeurUserIds = items.filter(u => u.role === UserRole.VENDEUR).map(u => u.id);
    if (vendeurUserIds.length > 0) {
      const vendeurs = await this.vendeurRepo
        .createQueryBuilder('vendeur')
        .where('vendeur.idUser IN (:...ids)', { ids: vendeurUserIds })
        .getMany();
      const vendeurMap = new Map(vendeurs.map(v => [v.idUser, v.nbrCmdConf]));
      userDtos.forEach(dto => {
        if (dto.role === UserRole.VENDEUR) {
          (dto as any).nbrCmdConf = vendeurMap.get(dto.id) ?? 0;
        }
      });
    }
    // Fetch associated vendeurs for CONFERMATEUR users
    const confermateurUserIds = items.filter(u => u.role === UserRole.CONFERMATEUR).map(u => u.id);
    if (confermateurUserIds.length > 0) {
      const confermateurs = await this.confermateurRepo
        .createQueryBuilder('confermateur')
        .leftJoinAndSelect('confermateur.vendeurs', 'vendeur')
        .leftJoinAndSelect('vendeur.user', 'user')
        .where('confermateur.idUser IN (:...ids)', { ids: confermateurUserIds })
        .getMany();
      
      const confermateurVendeursMap = new Map<string, Array<{ id: string; firstName: string; lastName: string }>>();
      confermateurs.forEach(conf => {
        const vendeurUsers = (conf.vendeurs || []).map(v => ({
          id: v.user?.id || '',
          firstName: v.user?.firstName || '',
          lastName: v.user?.lastName || '',
        })).filter(v => v.id); // Filter out any invalid entries
        if (vendeurUsers.length > 0) {
          confermateurVendeursMap.set(conf.idUser, vendeurUsers);
        }
      });
      
      userDtos.forEach(dto => {
        if (dto.role === UserRole.CONFERMATEUR) {
          const vendeurs = confermateurVendeursMap.get(dto.id);
          if (vendeurs && vendeurs.length > 0) {
            (dto as any).vendeurs = vendeurs;
          }
        }
      });
    }
    return { items: userDtos, total, page, limit };
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

  async getUserStats() {
    const [total, byRole, activeCount, inactiveCount] = await Promise.all([
      this.userRepo.count(),
      this.userRepo
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.role')
        .getRawMany(),
      this.userRepo.count({ where: { isActive: true } }),
      this.userRepo.count({ where: { isActive: false } }),
    ]);

    const byRoleMap: Record<string, number> = {};
    byRole.forEach((item: any) => {
      byRoleMap[item.role] = parseInt(item.count, 10);
    });

    // Count vendeurs with nbrCmdConf > 0
    const vendeursWithCmdConf = await this.vendeurRepo
      .createQueryBuilder('vendeur')
      .where('vendeur.nbrCmdConf > 0')
      .getCount();

    return {
      total,
      byRole: byRoleMap,
      active: activeCount,
      inactive: inactiveCount,
      vendeursWithCmdConf,
    };
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

  async incrementVendeurNbrCmdConf(userId: string, amount: number = 1): Promise<{ id: string; idUser: string; nbrCmdConf: number }> {
    const vendeur = await this.vendeurRepo.findOne({ where: { idUser: userId } });
    if (!vendeur) {
      throw new BadRequestException('Vendeur not found for this user');
    }
    const newValue = (vendeur.nbrCmdConf ?? 0) + amount;
    await this.vendeurRepo.update({ id: vendeur.id }, { nbrCmdConf: newValue });
    return {
      id: vendeur.id,
      idUser: vendeur.idUser,
      nbrCmdConf: newValue,
    };
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

  // Password reset functionality
  async requestPasswordReset(email: string): Promise<{ message: string; email: string }> {
    const user = await this.userRepo.findOne({ where: { email } });
    
    if (!user) {
      // For security, don't reveal if user exists or not
      return {
        message: 'If an account with this email exists, a password reset link has been sent.',
        email
      };
    }

    if (!user.isActive) {
      return {
        message: 'If an account with this email exists, a password reset link has been sent.',
        email
      };
    }

    // Deactivate any existing password reset tokens for this user
    await this.passwordResetRepo.update(
      { userId: user.id, isActive: true },
      { isActive: false }
    );

    // Generate new password reset token
    const token = this.generatePasswordResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save password reset token
    await this.passwordResetRepo.save(
      this.passwordResetRepo.create({
        token,
        userId: user.id,
        expiresAt,
        isActive: true,
      })
    );

    // Send email with reset link asynchronously
    this.sendPasswordResetEmailAsync(user.email, token, user.firstName);

    return {
      message: 'If an account with this email exists, a password reset link has been sent.',
      email
    };
  }

  async confirmPasswordResetToken(token: string): Promise<{
    isValid: boolean;
    email?: string;
    expiresAt?: Date;
    message: string;
  }> {
    // Find active password reset token
    const resetToken = await this.passwordResetRepo.findOne({
      where: { token, isActive: true },
      relations: ['user']
    });

    if (!resetToken) {
      return {
        isValid: false,
        message: 'Invalid or expired reset token'
      };
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      // Mark token as inactive
      await this.passwordResetRepo.update({ token }, { isActive: false });
      return {
        isValid: false,
        message: 'Reset token has expired'
      };
    }

    // Check if token has already been used
    if (resetToken.usedAt) {
      return {
        isValid: false,
        message: 'Reset token has already been used'
      };
    }

    // Check if user is still active
    if (!resetToken.user.isActive) {
      return {
        isValid: false,
        message: 'User account is no longer active'
      };
    }

    return {
      isValid: true,
      email: resetToken.user.email,
      expiresAt: resetToken.expiresAt,
      message: 'Token is valid and ready for password reset'
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Find active password reset token
    const resetToken = await this.passwordResetRepo.findOne({
      where: { token, isActive: true },
      relations: ['user']
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      await this.passwordResetRepo.update({ token }, { isActive: false });
      throw new BadRequestException('Reset token has expired');
    }

    // Check if token has already been used
    if (resetToken.usedAt) {
      throw new BadRequestException('Reset token has already been used');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await this.userRepo.update(resetToken.userId, { password: hashedPassword });

    // Mark token as used
    await this.passwordResetRepo.update(
      { token },
      { usedAt: new Date(), isActive: false }
    );

    // Invalidate all refresh tokens for security
    await this.refreshRepo.delete({ userId: resetToken.userId });

    return { message: 'Password has been reset successfully' };
  }

  private generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Clean up expired password reset tokens (call this periodically)
  async cleanupExpiredPasswordResetTokens(): Promise<void> {
    const now = new Date();
    await this.passwordResetRepo
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .where('expiresAt < :now', { now })
      .execute();
  }
}
