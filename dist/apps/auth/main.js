/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const app_controller_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(8);
const auth_service_1 = __webpack_require__(9);
const shared_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(10);
const user_entity_1 = __webpack_require__(12);
const refresh_token_entity_1 = __webpack_require__(19);
const vendeur_entity_1 = __webpack_require__(32);
const confermateur_entity_1 = __webpack_require__(33);
const seed_service_1 = __webpack_require__(34);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            shared_1.SharedModule,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, refresh_token_entity_1.RefreshToken, vendeur_entity_1.Vendeur, confermateur_entity_1.Confermateur]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, auth_service_1.AuthService, seed_service_1.SeedService],
    })
], AppModule);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const app_service_1 = __webpack_require__(8);
const auth_service_1 = __webpack_require__(9);
const create_user_dto_1 = __webpack_require__(23);
const user_response_dto_1 = __webpack_require__(25);
const login_dto_1 = __webpack_require__(26);
const auth_response_dto_1 = __webpack_require__(27);
const refresh_token_dto_1 = __webpack_require__(28);
const user_entity_1 = __webpack_require__(12);
const jwt_auth_guard_1 = __webpack_require__(29);
const roles_decorator_1 = __webpack_require__(30);
const roles_guard_1 = __webpack_require__(31);
let AppController = class AppController {
    constructor(appService, authService) {
        this.appService = appService;
        this.authService = authService;
    }
    getData() {
        return this.appService.getData();
    }
    async register(createUserDto) {
        return this.authService.register(createUserDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async refreshToken(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }
    async logout(refreshTokenDto) {
        return this.authService.logout(refreshTokenDto.refreshToken);
    }
    async logoutAll(body) {
        return this.authService.logoutAll(body.userId);
    }
    async findAll(role) {
        if (role) {
            return this.authService.findByRole(role);
        }
        return this.authService.findAll();
    }
    async findOne(id) {
        return this.authService.findOne(id);
    }
    getRoles() {
        return {
            roles: Object.values(user_entity_1.UserRole),
            description: {
                [user_entity_1.UserRole.ADMIN]: 'Full system access',
                [user_entity_1.UserRole.VENDEUR]: 'Sales management access',
                [user_entity_1.UserRole.CONFERMATEUR]: 'Confirmation access',
                [user_entity_1.UserRole.GUEST]: 'Limited access, no authentication required'
            }
        };
    }
    // Admin: manage users
    async updateUserRole(id, role) {
        return this.authService.updateUserRole(id, role);
    }
    async setUserActive(id, body) {
        return this.authService.setUserActive(id, body.isActive);
    }
    async deleteUser(id) {
        return this.authService.deleteUser(id);
    }
    // Vendeur: manage confermateurs associations
    async getConfermateursForVendeur(vendeurId) {
        return this.authService.getConfermateursForVendeur(vendeurId);
    }
    // Admin/Vendeur: list confermateurs
    async findConfermateurs() {
        return this.authService.findConfermateurs();
    }
    // Admin: manage assignment between confermateur and vendeur
    async assignVendeurToConfermateur(confermateurId, vendeurId) {
        return this.authService.assignVendeurToConfermateur(confermateurId, vendeurId);
    }
    async unassignVendeurFromConfermateur(confermateurId, vendeurId) {
        return this.authService.unassignVendeurFromConfermateur(confermateurId, vendeurId);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get welcome message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Welcome message' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
tslib_1.__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully registered', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof create_user_dto_1.CreateUserDto !== "undefined" && create_user_dto_1.CreateUserDto) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AppController.prototype, "register", null);
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful', type: auth_response_dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_e = typeof login_dto_1.LoginDto !== "undefined" && login_dto_1.LoginDto) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AppController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully', type: auth_response_dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_g = typeof refresh_token_dto_1.RefreshTokenDto !== "undefined" && refresh_token_dto_1.RefreshTokenDto) === "function" ? _g : Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AppController.prototype, "refreshToken", null);
tslib_1.__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully logged out' }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_j = typeof refresh_token_dto_1.RefreshTokenDto !== "undefined" && refresh_token_dto_1.RefreshTokenDto) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], AppController.prototype, "logout", null);
tslib_1.__decorate([
    (0, common_1.Post)('logout-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout from all devices' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully logged out from all devices' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], AppController.prototype, "logoutAll", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of users', type: [user_response_dto_1.UserResponseDto] }),
    tslib_1.__param(0, (0, common_1.Query)('role')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_m = typeof user_entity_1.UserRole !== "undefined" && user_entity_1.UserRole) === "function" ? _m : Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], AppController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], AppController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available roles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available roles' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getRoles", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Patch)('users/:id/role/:role'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: update user role' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Param)('role')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_q = typeof user_entity_1.UserRole !== "undefined" && user_entity_1.UserRole) === "function" ? _q : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "updateUserRole", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Patch)('users/:id/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: activate/deactivate user' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "setUserActive", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: delete user' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDEUR, user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('vendeurs/:vendeurId/confermateurs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get confermateurs assigned to a vendeur' }),
    tslib_1.__param(0, (0, common_1.Param)('vendeurId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getConfermateursForVendeur", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('confermateurs'),
    (0, swagger_1.ApiOperation)({ summary: 'List all confermateurs' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "findConfermateurs", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Post)('confermateurs/:confermateurId/vendeurs/:vendeurId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign vendeur to confermateur' }),
    tslib_1.__param(0, (0, common_1.Param)('confermateurId')),
    tslib_1.__param(1, (0, common_1.Param)('vendeurId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "assignVendeurToConfermateur", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Delete)('confermateurs/:confermateurId/vendeurs/:vendeurId'),
    (0, swagger_1.ApiOperation)({ summary: 'Unassign vendeur from confermateur' }),
    tslib_1.__param(0, (0, common_1.Param)('confermateurId')),
    tslib_1.__param(1, (0, common_1.Param)('vendeurId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "unassignVendeurFromConfermateur", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object])
], AppController);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(11);
const user_entity_1 = __webpack_require__(12);
const refresh_token_entity_1 = __webpack_require__(19);
const bcrypt = tslib_1.__importStar(__webpack_require__(20));
const jwt = tslib_1.__importStar(__webpack_require__(21));
const crypto = tslib_1.__importStar(__webpack_require__(22));
let AuthService = class AuthService {
    constructor(userRepo, refreshRepo) {
        this.userRepo = userRepo;
        this.refreshRepo = refreshRepo;
        // Map of confermateur userId -> set of vendeur userIds they manage (temp until relation is added in persistence layer)
        this.confermateurVendeurs = new Map();
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
        this.accessTokenExpiry = '15m'; // 15 minutes
        this.refreshTokenExpiry = '7d'; // 7 days
    }
    async register(createUserDto) {
        // Check if user already exists
        const existingUser = await this.userRepo.findOne({ where: { email: createUserDto.email } });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
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
            role: createUserDto.role || user_entity_1.UserRole.GUEST,
            isActive: true,
        });
        const saved = await this.userRepo.save(user);
        return this.toUserResponseDto(saved);
    }
    async login(loginDto) {
        const user = await this.userRepo.findOne({ where: { email: loginDto.email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
        await this.refreshRepo.save(this.refreshRepo.create({
            token: refreshToken,
            userId: user.id,
            expiresAt: refreshTokenExpiry,
            isActive: true,
        }));
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
    async refreshToken(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        // Check if refresh token exists and is valid
        const tokenData = await this.refreshRepo.findOne({ where: { token: refreshToken, isActive: true } });
        if (!tokenData || !tokenData.isActive) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        // Check if refresh token is expired
        if (new Date() > tokenData.expiresAt) {
            await this.refreshRepo.delete({ token: refreshToken });
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        // Find user
        const user = await this.userRepo.findOne({ where: { id: tokenData.userId } });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
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
        await this.refreshRepo.save(this.refreshRepo.create({
            token: newRefreshToken,
            userId: user.id,
            expiresAt: refreshTokenExpiry,
            isActive: true,
        }));
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
    async logout(refreshToken) {
        // Invalidate refresh token
        await this.refreshRepo.delete({ token: refreshToken });
        return { message: 'Successfully logged out' };
    }
    async logoutAll(userId) {
        // Invalidate all refresh tokens for user
        await this.refreshRepo.delete({ userId });
        return { message: 'Successfully logged out from all devices' };
    }
    generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }
    async findAll() {
        const users = await this.userRepo.find();
        return users.map(u => this.toUserResponseDto(u));
    }
    async findOne(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        return this.toUserResponseDto(user);
    }
    async findByRole(role) {
        const users = await this.userRepo.find({ where: { role } });
        return users.map(u => this.toUserResponseDto(u));
    }
    // Clean up expired refresh tokens (call this periodically)
    async cleanupExpiredTokens() {
        const now = new Date();
        await this.refreshRepo.delete({ expiresAt: null }); // placeholder when using query builder
    }
    toUserResponseDto(user) {
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
    async updateUserRole(id, role) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        user.role = role;
        await this.userRepo.save(user);
        return this.toUserResponseDto(user);
    }
    async setUserActive(id, isActive) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        user.isActive = isActive;
        await this.userRepo.save(user);
        return this.toUserResponseDto(user);
    }
    async deleteUser(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
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
    async findConfermateurs() {
        return this.findByRole(user_entity_1.UserRole.CONFERMATEUR);
    }
    async assignVendeurToConfermateur(confermateurId, vendeurId) {
        const confermateur = await this.userRepo.findOne({ where: { id: confermateurId, role: user_entity_1.UserRole.CONFERMATEUR } });
        if (!confermateur) {
            throw new common_1.BadRequestException('Confermateur not found');
        }
        const vendeur = await this.userRepo.findOne({ where: { id: vendeurId, role: user_entity_1.UserRole.VENDEUR } });
        if (!vendeur) {
            throw new common_1.BadRequestException('Vendeur not found');
        }
        const set = this.confermateurVendeurs.get(confermateurId) || new Set();
        set.add(vendeurId);
        this.confermateurVendeurs.set(confermateurId, set);
        return { message: 'Vendeur assigned to confermateur' };
    }
    async unassignVendeurFromConfermateur(confermateurId, vendeurId) {
        const set = this.confermateurVendeurs.get(confermateurId);
        if (!set) {
            return { message: 'No association existed' };
        }
        set.delete(vendeurId);
        this.confermateurVendeurs.set(confermateurId, set);
        return { message: 'Vendeur unassigned from confermateur' };
    }
    async getConfermateursForVendeur(vendeurId) {
        const result = [];
        for (const [confId, vSet] of this.confermateurVendeurs.entries()) {
            if (vSet.has(vendeurId)) {
                const user = await this.userRepo.findOne({ where: { id: confId } });
                if (user)
                    result.push(this.toUserResponseDto(user));
            }
        }
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], AuthService);


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = exports.UserRole = void 0;
const tslib_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(11);
const shared_1 = __webpack_require__(13);
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["VENDEUR"] = "vendeur";
    UserRole["CONFERMATEUR"] = "confermateur";
    UserRole["GUEST"] = "guest";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User extends shared_1.BaseEntity {
};
exports.User = User;
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], User.prototype, "password", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.GUEST
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ default: true }),
    tslib_1.__metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], User.prototype, "lastLoginAt", void 0);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Unique)(['email'])
], User);


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(6);
tslib_1.__exportStar(__webpack_require__(14), exports);
tslib_1.__exportStar(__webpack_require__(15), exports);
tslib_1.__exportStar(__webpack_require__(17), exports);
tslib_1.__exportStar(__webpack_require__(18), exports);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const database_module_1 = __webpack_require__(15);
const database_service_1 = __webpack_require__(17);
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        providers: [database_service_1.DatabaseService],
        exports: [database_module_1.DatabaseModule, database_service_1.DatabaseService],
    })
], SharedModule);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const config_1 = __webpack_require__(16);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: parseInt(configService.get('DB_PORT', '5432')),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'password'),
                    database: configService.get('DB_NAME', 'you_fizz'),
                    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV') === 'development',
                    logging: configService.get('NODE_ENV') === 'development',
                    retryAttempts: 10,
                    retryDelay: 3000,
                    autoLoadEntities: true,
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(11);
let DatabaseService = class DatabaseService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async healthCheck() {
        try {
            await this.dataSource.query('SELECT 1');
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectDataSource)()),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object])
], DatabaseService);


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseEntity = void 0;
const tslib_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(11);
class BaseEntity {
}
exports.BaseEntity = BaseEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], BaseEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BaseEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], BaseEntity.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], BaseEntity.prototype, "deletedAt", void 0);


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshToken = void 0;
const tslib_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(11);
const shared_1 = __webpack_require__(13);
const user_entity_1 = __webpack_require__(12);
let RefreshToken = class RefreshToken extends shared_1.BaseEntity {
};
exports.RefreshToken = RefreshToken;
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], RefreshToken.prototype, "token", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], RefreshToken.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], RefreshToken.prototype, "expiresAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ default: true }),
    tslib_1.__metadata("design:type", Boolean)
], RefreshToken.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _b : Object)
], RefreshToken.prototype, "user", void 0);
exports.RefreshToken = RefreshToken = tslib_1.__decorate([
    (0, typeorm_1.Entity)('refresh_tokens')
], RefreshToken);


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDto = void 0;
const tslib_1 = __webpack_require__(6);
const class_validator_1 = __webpack_require__(24);
const swagger_1 = __webpack_require__(4);
const user_entity_1 = __webpack_require__(12);
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123', minLength: 6 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        example: user_entity_1.UserRole.ADMIN,
        enum: user_entity_1.UserRole,
        description: 'User role: admin, vendeur, cofermateur, or guest',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_entity_1.UserRole),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.UserRole !== "undefined" && user_entity_1.UserRole) === "function" ? _a : Object)
], CreateUserDto.prototype, "role", void 0);


/***/ }),
/* 24 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserResponseDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
const user_entity_1 = __webpack_require__(12);
class UserResponseDto {
}
exports.UserResponseDto = UserResponseDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], UserResponseDto.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], UserResponseDto.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_entity_1.UserRole }),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.UserRole !== "undefined" && user_entity_1.UserRole) === "function" ? _a : Object)
], UserResponseDto.prototype, "role", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Boolean)
], UserResponseDto.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], UserResponseDto.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], UserResponseDto.prototype, "updatedAt", void 0);


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginDto = void 0;
const tslib_1 = __webpack_require__(6);
const class_validator_1 = __webpack_require__(24);
const swagger_1 = __webpack_require__(4);
class LoginDto {
}
exports.LoginDto = LoginDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123', minLength: 6 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    tslib_1.__metadata("design:type", String)
], LoginDto.prototype, "password", void 0);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthResponseDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
const user_response_dto_1 = __webpack_require__(25);
class AuthResponseDto {
    constructor() {
        this.tokenType = 'Bearer';
    }
}
exports.AuthResponseDto = AuthResponseDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_response_dto_1.UserResponseDto !== "undefined" && user_response_dto_1.UserResponseDto) === "function" ? _a : Object)
], AuthResponseDto.prototype, "user", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AuthResponseDto.prototype, "tokenType", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], AuthResponseDto.prototype, "expiresIn", void 0);


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenDto = void 0;
const tslib_1 = __webpack_require__(6);
const class_validator_1 = __webpack_require__(24);
const swagger_1 = __webpack_require__(4);
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ example: 'your-refresh-token-here' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const jwt = tslib_1.__importStar(__webpack_require__(21));
let JwtAuthGuard = class JwtAuthGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers['authorization'];
        if (!auth)
            throw new common_1.UnauthorizedException('Missing Authorization header');
        const [type, token] = auth.split(' ');
        if (type !== 'Bearer' || !token)
            throw new common_1.UnauthorizedException('Invalid auth header');
        try {
            const secret = process.env.JWT_SECRET || 'your-secret-key';
            const payload = jwt.verify(token, secret);
            request.user = payload;
            return true;
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const roles_decorator_1 = __webpack_require__(30);
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user?.role)
            return false;
        return requiredRoles.includes(user.role);
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Vendeur = void 0;
const tslib_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(11);
const shared_1 = __webpack_require__(13);
const user_entity_1 = __webpack_require__(12);
let Vendeur = class Vendeur extends shared_1.BaseEntity {
};
exports.Vendeur = Vendeur;
tslib_1.__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'id_user' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], Vendeur.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.RelationId)((v) => v.user),
    tslib_1.__metadata("design:type", String)
], Vendeur.prototype, "idUser", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'nbr_cmd_conf', type: 'int', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], Vendeur.prototype, "nbrCmdConf", void 0);
exports.Vendeur = Vendeur = tslib_1.__decorate([
    (0, typeorm_1.Entity)('vendeurs')
], Vendeur);


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Confermateur = void 0;
const tslib_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(11);
const shared_1 = __webpack_require__(13);
const user_entity_1 = __webpack_require__(12);
const vendeur_entity_1 = __webpack_require__(32);
let Confermateur = class Confermateur extends shared_1.BaseEntity {
};
exports.Confermateur = Confermateur;
tslib_1.__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'id_user' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], Confermateur.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.RelationId)((c) => c.user),
    tslib_1.__metadata("design:type", String)
], Confermateur.prototype, "idUser", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToMany)(() => vendeur_entity_1.Vendeur),
    (0, typeorm_1.JoinTable)({
        name: 'confermateur_vendeurs',
        joinColumn: { name: 'confermateur_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'vendeur_id', referencedColumnName: 'id' }
    }),
    tslib_1.__metadata("design:type", Array)
], Confermateur.prototype, "vendeurs", void 0);
exports.Confermateur = Confermateur = tslib_1.__decorate([
    (0, typeorm_1.Entity)('confermateurs')
], Confermateur);


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SeedService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(11);
const user_entity_1 = __webpack_require__(12);
const bcrypt = tslib_1.__importStar(__webpack_require__(20));
let SeedService = class SeedService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async onModuleInit() {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@youfizz.local';
        const exists = await this.userRepo.findOne({ where: { email: adminEmail } });
        if (exists)
            return;
        const saltRounds = 10;
        const password = process.env.ADMIN_PASSWORD || 'admin1234';
        const hash = await bcrypt.hash(password, saltRounds);
        await this.userRepo.save(this.userRepo.create({
            email: adminEmail,
            password: hash,
            role: user_entity_1.UserRole.ADMIN,
            isActive: true,
            firstName: 'Admin',
            lastName: 'User',
        }));
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], SeedService);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const app_module_1 = __webpack_require__(5);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: { port: 4001 },
    });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Auth Service')
        .setDescription('Auth API')
        .setVersion('1.0')
        .addTag('auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    await app.startAllMicroservices();
    const port = 3001;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    common_1.Logger.log(`🚀 Microservice is listening on TCP port: ${port}`);
    common_1.Logger.log(`📖 Swagger docs available on: http://localhost:${port}/api-docs`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map