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
  // DEPRECATED: This in-memory Map is no longer used. Relationships are now persisted in the database.
  // Kept for backward compatibility but will be removed in a future version.
  // @deprecated Use database relationships via Confermateur entity instead
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
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return {};
    }

    const [vendeur, confermateur] = await Promise.all([
      this.vendeurRepo.findOne({ where: { idUser: userId } }),
      this.confermateurRepo.findOne({ where: { idUser: userId } })
    ]);

    let finalConfermateur = confermateur;

    // Create Confermateur entity if user is CONFERMATEUR but entity doesn't exist
    if (user.role === UserRole.CONFERMATEUR && !confermateur) {
      finalConfermateur = this.confermateurRepo.create({
        idUser: userId,
        vendeurs: []
      });
      await this.confermateurRepo.save(finalConfermateur);
    }

    return {
      vendorId: vendeur?.id,
      confirmateurId: finalConfermateur?.id
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find();
    return users.map(u => this.toUserResponseDto(u));
  }

  async findAllPaginated(params: { role?: UserRole; page: number | string; limit: number | string; }): Promise<{ items: (UserResponseDto & { nbrCmdConf?: number; vendeurs?: Array<{ id: string; firstName: string; lastName: string; email: string }> })[]; total: number; page: number; limit: number; }> {
    const { role } = params;
    const page = Number(params.page);
    const limit = Number(params.limit);
    const pageNum = Number.isFinite(page) && page > 0 ? page : 1;
    const limitNum = Number.isFinite(limit) && limit > 0 ? limit : 10;
    const where = role ? { role } as any : {};
    const [items, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
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
    const confermateurVendeursMap = new Map<string, Array<{ id: string; firstName: string; lastName: string; email: string }>>();
    
    // Use helper method for each confermateur to handle edge cases
    if (confermateurUserIds.length > 0) {
      await Promise.all(
        confermateurUserIds.map(async (confermateurUserId) => {
          const vendeurUsers = await this.getVendeurUsersForConfermateur(confermateurUserId);
        if (vendeurUsers.length > 0) {
            confermateurVendeursMap.set(confermateurUserId, vendeurUsers);
          }
        })
      );
        }
      
    // Always set vendeurs field for CONFERMATEUR users (empty array if none)
      userDtos.forEach(dto => {
        if (dto.role === UserRole.CONFERMATEUR) {
          const vendeurs = confermateurVendeursMap.get(dto.id);
        (dto as any).vendeurs = vendeurs || [];
        }
      });
    return { items: userDtos, total, page: pageNum, limit: limitNum };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.toUserResponseDto(user);
  }

  async findUserByEmail(email: string, role?: UserRole): Promise<UserResponseDto | null> {
    // Normalize email: trim whitespace
    const normalizedEmail = email.trim();
    
    // Use query builder for case-insensitive email search
    // This handles cases where email might be stored with different casing
    const queryBuilder = this.userRepo.createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email: normalizedEmail });
    
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }
    
    const user = await queryBuilder.getOne();
    
    if (!user) {
      return null;
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
    await this.userRepo.delete({ id });
    // Database CASCADE delete will handle relationships automatically via entity relationships
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

  async getConfermateurByUserId(userId: string): Promise<Confermateur> {
    const confermateur = await this.confermateurRepo.findOne({
      where: { idUser: userId },
      relations: ['vendeurs', 'vendeurs.user']
    });
    
    if (!confermateur) {
      throw new BadRequestException(`Confermateur entity not found for user ID: ${userId}`);
    }
    
    return confermateur;
  }

  async getVendeurByUserId(userId: string): Promise<Vendeur> {
    const vendeur = await this.vendeurRepo.findOne({
      where: { idUser: userId },
      relations: ['user']
    });
    
    if (!vendeur) {
      throw new BadRequestException(`Vendeur entity not found for user ID: ${userId}`);
    }
    
    return vendeur;
  }

  async sendConfermateurAssignmentRequest(vendeurId: string, confermateurEmail: string): Promise<{ message: string }> {
    // Step 1: Validate vendeur user exists
    const vendeurUser = await this.userRepo.findOne({ 
      where: { id: vendeurId, role: UserRole.VENDEUR } 
    });
    
    if (!vendeurUser) {
      throw new BadRequestException('Vendeur user not found');
    }

    // Step 2: Find confermateur user by email
    const confermateurUser = await this.findUserByEmail(confermateurEmail, UserRole.CONFERMATEUR);
    
    if (!confermateurUser) {
      throw new BadRequestException(`No confermateur found with email: ${confermateurEmail}`);
    }

    // Step 3: Check if already assigned
    const confermateur = await this.confermateurRepo.findOne({
      where: { idUser: confermateurUser.id },
      relations: ['vendeurs']
    });

    if (confermateur) {
      const vendeur = await this.vendeurRepo.findOne({ where: { idUser: vendeurId } });
      if (vendeur && confermateur.vendeurs?.some(v => v.id === vendeur.id)) {
        throw new BadRequestException('Vendeur is already assigned to this confermateur');
      }
    }

    // Step 4: Generate accept and refuse URLs
    // Use API gateway URL or backend URL for the links
    const apiBaseUrl = process.env.API_GATEWAY_URL || process.env.BACKEND_URL || 'http://localhost:3000';
    const acceptUrl = `${apiBaseUrl}/api/auth/confermateurs/${confermateurUser.id}/accept-vendeur/${vendeurId}`;
    const refuseUrl = `${apiBaseUrl}/api/auth/confermateurs/${confermateurUser.id}/refuse-vendeur/${vendeurId}`;

    // Step 5: Send email
    await this.notificationClient.sendConfermateurAssignmentRequestEmail({
      confermateurEmail: confermateurUser.email,
      confermateurName: `${confermateurUser.firstName || ''} ${confermateurUser.lastName || ''}`.trim() || confermateurUser.email,
      vendeurName: `${vendeurUser.firstName || ''} ${vendeurUser.lastName || ''}`.trim() || vendeurUser.email,
      vendeurEmail: vendeurUser.email,
      acceptUrl,
      refuseUrl,
    });

    return { message: 'Assignment request email sent successfully to confermateur' };
  }

  async refuseVendeurAssignment(confermateurId: string, vendeurId: string): Promise<{ message: string }> {
    // Validate that both users exist
    const confermateurUser = await this.userRepo.findOne({ 
      where: { id: confermateurId, role: UserRole.CONFERMATEUR } 
    });
    
    if (!confermateurUser) {
      throw new BadRequestException('Confermateur user not found');
    }

    const vendeurUser = await this.userRepo.findOne({ 
      where: { id: vendeurId, role: UserRole.VENDEUR } 
    });
    
    if (!vendeurUser) {
      throw new BadRequestException('Vendeur user not found');
    }

    // Return success message (no action needed, just acknowledging the refusal)
    return { message: 'Assignment request refused successfully' };
  }

  async assignVendeurToConfermateur(confermateurId: string, vendeurId: string): Promise<{ message: string }> {
    // Step 1: Check if user exists at all (for better error messages)
    const confermateurUser = await this.userRepo.findOne({ 
      where: { id: confermateurId } 
    });
    
    if (!confermateurUser) {
      throw new BadRequestException(`User with ID ${confermateurId} not found`);
    }
    
    // Step 2: Validate user has CONFERMATEUR role
    if (confermateurUser.role !== UserRole.CONFERMATEUR) {
      throw new BadRequestException(
        `User with ID ${confermateurId} has role '${confermateurUser.role}', expected '${UserRole.CONFERMATEUR}'`
      );
    }
    
    // Step 3: Validate vendeur user exists
    const vendeurUser = await this.userRepo.findOne({ 
      where: { id: vendeurId } 
    });
    
    if (!vendeurUser) {
      throw new BadRequestException(`User with ID ${vendeurId} not found`);
    }
    
    // Step 4: Validate user has VENDEUR role
    if (vendeurUser.role !== UserRole.VENDEUR) {
      throw new BadRequestException(
        `User with ID ${vendeurId} has role '${vendeurUser.role}', expected '${UserRole.VENDEUR}'`
      );
    }

    // Step 5: Find or create the Confermateur entity
    let confermateur = await this.confermateurRepo.findOne({ 
      where: { idUser: confermateurId },
      relations: ['vendeurs']
    });

    if (!confermateur) {
      // Create confermateur entity if it doesn't exist
      confermateur = this.confermateurRepo.create({
        idUser: confermateurId,
        vendeurs: []
      });
      await this.confermateurRepo.save(confermateur);
      // Reload with relations to ensure we have the entity with proper structure
      confermateur = await this.confermateurRepo.findOne({ 
        where: { idUser: confermateurId },
        relations: ['vendeurs']
      });
    }

    // Step 6: Find the Vendeur entity (by idUser, not by id)
    const vendeur = await this.vendeurRepo.findOne({ 
      where: { idUser: vendeurId } 
    });
    if (!vendeur) {
      throw new BadRequestException('Vendeur entity not found. Vendeur must be created first.');
    }

    // Step 7: Check if vendeur is already associated
    if (!confermateur.vendeurs) {
      confermateur.vendeurs = [];
    }
    
    const isAlreadyAssociated = confermateur.vendeurs.some(v => v.id === vendeur.id);
    if (isAlreadyAssociated) {
      return { message: 'Vendeur is already assigned to this confermateur' };
    }

    // Step 8: Add vendeur to confermateur's vendeurs array and save
    // TypeORM will handle the ManyToMany relationship via the join table
    confermateur.vendeurs.push(vendeur);
    await this.confermateurRepo.save(confermateur);

    return { message: 'Vendeur assigned to confermateur successfully' };
  }

  async unassignVendeurFromConfermateur(confermateurId: string, vendeurId: string): Promise<{ message: string }> {
    const confermateur = await this.confermateurRepo.findOne({ 
      where: { idUser: confermateurId },
      relations: ['vendeurs']
    });
    
    if (!confermateur || !confermateur.vendeurs || confermateur.vendeurs.length === 0) {
      return { message: 'No association existed' };
    }

    const vendeur = await this.vendeurRepo.findOne({ where: { idUser: vendeurId } });
    if (!vendeur) {
      throw new BadRequestException('Vendeur entity not found');
    }

    const initialLength = confermateur.vendeurs.length;
    confermateur.vendeurs = confermateur.vendeurs.filter(v => v.id !== vendeur.id);
    
    if (confermateur.vendeurs.length < initialLength) {
      await this.confermateurRepo.save(confermateur);
    return { message: 'Vendeur unassigned from confermateur' };
  }

    return { message: 'No association existed' };
  }

  /**
   * Get vendeur user information for a given confermateur user ID
   * Flow: Confermateur (by idUser) -> Vendeur entities -> User entities
   * 
   * @param confermateurUserId - The user ID of the confermateur
   * @returns Array of vendeur user information (id, firstName, lastName, email)
   */
  private async getVendeurUsersForConfermateur(confermateurUserId: string): Promise<Array<{ id: string; firstName: string; lastName: string; email: string }>> {
    try {
      // Step 1: Find Confermateur entity by idUser
      const confermateur = await this.confermateurRepo.findOne({
        where: { idUser: confermateurUserId },
        relations: ['vendeurs', 'vendeurs.user']
      });

      // Edge case: Confermateur entity doesn't exist
      if (!confermateur) {
        return [];
      }

      // Step 2: Get vendeurs array from Confermateur (ManyToMany relationship)
      // Edge case: Empty vendeurs array
      if (!confermateur.vendeurs || confermateur.vendeurs.length === 0) {
        return [];
      }

      // Step 3: Map vendeur entities to user information
      // Each Vendeur has idUser field and user relation
      const vendeurUsers = confermateur.vendeurs
        .map(v => {
          // Edge case: Missing user entity
          if (!v.user) {
            return null;
          }
          return {
            id: v.user.id,
            firstName: v.user.firstName || '',
            lastName: v.user.lastName || '',
            email: v.user.email || '',
          };
        })
        .filter((v): v is { id: string; firstName: string; lastName: string; email: string } => v !== null && v.id !== '');

      return vendeurUsers;
    } catch (error) {
      // Error handling: Log and return empty array on any error
      console.error(`Error fetching vendeur users for confermateur ${confermateurUserId}:`, error);
      return [];
    }
  }

  /**
   * Public method: get vendors (users) assigned to a confermateur user ID.
   * Thin wrapper around the internal helper for use by controllers/other services.
   */
  async getVendeursForConfermateur(
    confermateurUserId: string,
  ): Promise<Array<{ id: string; firstName: string; lastName: string; email: string }>> {
    return this.getVendeurUsersForConfermateur(confermateurUserId);
  }

  async getConfermateursForVendeur(vendeurId: string): Promise<UserResponseDto[]> {
    // Find the vendeur entity
    const vendeur = await this.vendeurRepo.findOne({ where: { idUser: vendeurId } });
    if (!vendeur) {
      return [];
    }

    // Query all confermateurs that have this vendeur in their vendeurs array
    const confermateurs = await this.confermateurRepo
      .createQueryBuilder('confermateur')
      .leftJoinAndSelect('confermateur.vendeurs', 'vendeur')
      .where('vendeur.id = :vendeurId', { vendeurId: vendeur.id })
      .getMany();

    // Get user IDs and fetch user entities
    const confermateurUserIds = confermateurs.map(c => c.idUser);
    if (confermateurUserIds.length === 0) {
      return [];
    }

    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids: confermateurUserIds })
      .getMany();

    return users.map(u => this.toUserResponseDto(u));
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
