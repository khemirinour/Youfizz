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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const axios_1 = __webpack_require__(6);
const throttler_1 = __webpack_require__(7);
const app_controller_1 = __webpack_require__(8);
const app_service_1 = __webpack_require__(11);
const auth_service_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(15);
const jwt_1 = __webpack_require__(26);
const passport_1 = __webpack_require__(27);
const shared_2 = __webpack_require__(15);
const typeorm_1 = __webpack_require__(13);
const rate_limiting_config_1 = __webpack_require__(79);
const user_entity_1 = __webpack_require__(60);
const refresh_token_entity_1 = __webpack_require__(63);
const password_reset_token_entity_1 = __webpack_require__(65);
const vendeur_entity_1 = __webpack_require__(62);
const confermateur_entity_1 = __webpack_require__(64);
const seed_service_1 = __webpack_require__(80);
const notification_client_1 = __webpack_require__(59);
const vendors_controller_1 = __webpack_require__(81);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            shared_1.SharedModule,
            axios_1.HttpModule,
            throttler_1.ThrottlerModule.forRoot((0, rate_limiting_config_1.getRateLimitingConfig)()),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, refresh_token_entity_1.RefreshToken, password_reset_token_entity_1.PasswordResetToken, vendeur_entity_1.Vendeur, confermateur_entity_1.Confermateur]),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') },
            }),
        ],
        controllers: [app_controller_1.AppController, vendors_controller_1.VendorsController],
        providers: [app_service_1.AppService, auth_service_1.AuthService, seed_service_1.SeedService, notification_client_1.NotificationClient, shared_1.SharedRateLimitGuard, shared_1.LoggingInterceptor, shared_1.ResponseInterceptor, shared_2.JwtStrategy],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(9);
const throttler_1 = __webpack_require__(7);
const custom_throttler_guard_1 = __webpack_require__(10);
const app_service_1 = __webpack_require__(11);
const auth_service_1 = __webpack_require__(12);
const create_user_dto_1 = __webpack_require__(66);
const user_response_dto_1 = __webpack_require__(68);
const login_dto_1 = __webpack_require__(69);
const auth_response_dto_1 = __webpack_require__(70);
const refresh_token_dto_1 = __webpack_require__(71);
const request_password_reset_dto_1 = __webpack_require__(72);
const reset_password_dto_1 = __webpack_require__(73);
const password_reset_response_dto_1 = __webpack_require__(74);
const confirm_password_reset_dto_1 = __webpack_require__(75);
const password_reset_confirmation_response_dto_1 = __webpack_require__(76);
const user_entity_1 = __webpack_require__(60);
const shared_1 = __webpack_require__(15);
const roles_decorator_1 = __webpack_require__(77);
const roles_guard_1 = __webpack_require__(78);
let AppController = class AppController {
    constructor(appService, authService) {
        this.appService = appService;
        this.authService = authService;
    }
    getData() {
        return this.appService.getData();
    }
    async healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'auth',
        };
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
    // Password reset endpoints
    async requestPasswordReset(requestPasswordResetDto) {
        return this.authService.requestPasswordReset(requestPasswordResetDto.email);
    }
    async confirmPasswordResetToken(confirmPasswordResetDto) {
        return this.authService.confirmPasswordResetToken(confirmPasswordResetDto.token);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get welcome message' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Welcome message',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Hello API!' }
            }
        }
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
tslib_1.__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Service health status',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time' },
                service: { type: 'string', example: 'auth' }
            }
        }
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "healthCheck", null);
tslib_1.__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(custom_throttler_guard_1.CustomThrottlerGuard),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 60000 } }) // 5 registrations per minute
    ,
    (0, swagger_1.ApiOperation)({
        summary: 'Register a new user',
        description: 'Creates a new user account in the system. The user will receive a welcome email upon successful registration.'
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'User successfully registered',
        type: user_response_dto_1.UserResponseDto
    }),
    (0, swagger_1.ApiBadRequestResponse)({
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
    }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'User already exists',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'User with this email already exists' },
                error: { type: 'string', example: 'Conflict' },
                statusCode: { type: 'number', example: 409 }
            }
        }
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Too many requests - rate limit exceeded',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Too many registration attempts. Please wait before trying again.' },
                statusCode: { type: 'number', example: 429 },
                retryAfter: { type: 'number', example: 60 }
            }
        }
    }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof create_user_dto_1.CreateUserDto !== "undefined" && create_user_dto_1.CreateUserDto) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AppController.prototype, "register", null);
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)(custom_throttler_guard_1.CustomThrottlerGuard),
    (0, throttler_1.Throttle)({ short: { limit: 10, ttl: 60000 } }) // 10 login attempts per minute
    ,
    (0, swagger_1.ApiOperation)({
        summary: 'Login user',
        description: 'Authenticate user with email and password to receive access and refresh tokens.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Login successful',
        type: auth_response_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad request - validation errors'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Invalid credentials',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid email or password' },
                error: { type: 'string', example: 'Unauthorized' },
                statusCode: { type: 'number', example: 401 }
            }
        }
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Too many requests - rate limit exceeded'
    }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_e = typeof login_dto_1.LoginDto !== "undefined" && login_dto_1.LoginDto) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AppController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh access token',
        description: 'Generate new access token using valid refresh token.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Token refreshed successfully',
        type: auth_response_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad request - validation errors'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Invalid refresh token',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid refresh token' },
                error: { type: 'string', example: 'Unauthorized' },
                statusCode: { type: 'number', example: 401 }
            }
        }
    }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_g = typeof refresh_token_dto_1.RefreshTokenDto !== "undefined" && refresh_token_dto_1.RefreshTokenDto) === "function" ? _g : Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AppController.prototype, "refreshToken", null);
tslib_1.__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({
        summary: 'Logout user',
        description: 'Invalidate refresh token to log out user from current session.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Successfully logged out',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Successfully logged out' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad request - validation errors'
    }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_j = typeof refresh_token_dto_1.RefreshTokenDto !== "undefined" && refresh_token_dto_1.RefreshTokenDto) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], AppController.prototype, "logout", null);
tslib_1.__decorate([
    (0, common_1.Post)('logout-all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Logout from all devices',
        description: 'Invalidate all refresh tokens for a user to log out from all devices.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Successfully logged out from all devices',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Successfully logged out from all devices' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad request - validation errors'
    }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], AppController.prototype, "logoutAll", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users',
        description: 'Retrieve list of all users. Admin only. Can filter by role.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiQuery)({
        name: 'role',
        required: false,
        enum: user_entity_1.UserRole,
        description: 'Filter users by role'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'List of users',
        type: [user_response_dto_1.UserResponseDto]
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role - Admin required' }),
    tslib_1.__param(0, (0, common_1.Query)('role')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_m = typeof user_entity_1.UserRole !== "undefined" && user_entity_1.UserRole) === "function" ? _m : Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], AppController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user by ID',
        description: 'Retrieve specific user by ID. Admin only.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'User found',
        type: user_response_dto_1.UserResponseDto
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid user ID format'
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'User not found'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role - Admin required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], AppController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available roles',
        description: 'Retrieve list of available user roles and their descriptions.'
    }),
    (0, swagger_1.ApiOkResponse)({
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
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getRoles", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Patch)('users/:id/role/:role'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin: update user role',
        description: 'Update user role. Admin only.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'User role updated successfully',
        type: user_response_dto_1.UserResponseDto
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid user ID or role'
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'User not found'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role - Admin required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Param)('role')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_q = typeof user_entity_1.UserRole !== "undefined" && user_entity_1.UserRole) === "function" ? _q : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "updateUserRole", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Patch)('users/:id/active'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin: activate/deactivate user',
        description: 'Activate or deactivate user account. Admin only.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'User status updated successfully',
        type: user_response_dto_1.UserResponseDto
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid user ID or status'
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'User not found'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role - Admin required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "setUserActive", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin: delete user',
        description: 'Delete user account permanently. Admin only.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'User deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'User deleted successfully' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid user ID'
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'User not found'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role - Admin required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDEUR, user_entity_1.UserRole.ADMIN),
    (0, common_1.Get)('vendeurs/:vendeurId/confermateurs'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get confermateurs assigned to a vendeur',
        description: 'Retrieve list of confermateurs assigned to a specific vendeur.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'Confermateurs retrieved successfully'
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid vendeur ID'
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Vendeur not found'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role - Vendeur or Admin required' }),
    tslib_1.__param(0, (0, common_1.Param)('vendeurId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getConfermateursForVendeur", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, common_1.Get)('confermateurs'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all confermateurs',
        description: 'Retrieve list of all confermateurs in the system.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'Confermateurs retrieved successfully'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "findConfermateurs", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Post)('confermateurs/:confermateurId/vendeurs/:vendeurId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Assign vendeur to confermateur',
        description: 'Create assignment between confermateur and vendeur. Admin only.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Assignment created successfully'
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid confermateur or vendeur ID'
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Confermateur or vendeur not found'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role - Admin required' }),
    tslib_1.__param(0, (0, common_1.Param)('confermateurId')),
    tslib_1.__param(1, (0, common_1.Param)('vendeurId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "assignVendeurToConfermateur", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Delete)('confermateurs/:confermateurId/vendeurs/:vendeurId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Unassign vendeur from confermateur',
        description: 'Remove assignment between confermateur and vendeur. Admin only.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'Assignment removed successfully'
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid confermateur or vendeur ID'
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Assignment not found'
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role - Admin required' }),
    tslib_1.__param(0, (0, common_1.Param)('confermateurId')),
    tslib_1.__param(1, (0, common_1.Param)('vendeurId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "unassignVendeurFromConfermateur", null);
tslib_1.__decorate([
    (0, common_1.Post)('password-reset/request'),
    (0, common_1.UseGuards)(custom_throttler_guard_1.CustomThrottlerGuard),
    (0, throttler_1.Throttle)({ short: { limit: 3, ttl: 300000 } }) // 3 password reset requests per 5 minutes
    ,
    (0, swagger_1.ApiOperation)({
        summary: 'Request password reset',
        description: 'Send password reset email to user if account exists. Rate limited to prevent abuse.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Password reset email sent (if account exists)',
        type: password_reset_response_dto_1.PasswordResetResponseDto
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad request - validation errors'
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Too many requests - rate limit exceeded'
    }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_r = typeof request_password_reset_dto_1.RequestPasswordResetDto !== "undefined" && request_password_reset_dto_1.RequestPasswordResetDto) === "function" ? _r : Object]),
    tslib_1.__metadata("design:returntype", typeof (_s = typeof Promise !== "undefined" && Promise) === "function" ? _s : Object)
], AppController.prototype, "requestPasswordReset", null);
tslib_1.__decorate([
    (0, common_1.Post)('password-reset/confirm'),
    (0, common_1.UseGuards)(custom_throttler_guard_1.CustomThrottlerGuard),
    (0, throttler_1.Throttle)({ short: { limit: 10, ttl: 60000 } }) // 10 token confirmations per minute
    ,
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm password reset token validity',
        description: 'Verify if password reset token is valid and not expired.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Token validation result',
        type: password_reset_confirmation_response_dto_1.PasswordResetConfirmationResponseDto
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad request - validation errors'
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Too many requests - rate limit exceeded'
    }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_t = typeof confirm_password_reset_dto_1.ConfirmPasswordResetDto !== "undefined" && confirm_password_reset_dto_1.ConfirmPasswordResetDto) === "function" ? _t : Object]),
    tslib_1.__metadata("design:returntype", typeof (_u = typeof Promise !== "undefined" && Promise) === "function" ? _u : Object)
], AppController.prototype, "confirmPasswordResetToken", null);
tslib_1.__decorate([
    (0, common_1.Post)('password-reset/reset'),
    (0, common_1.UseGuards)(custom_throttler_guard_1.CustomThrottlerGuard),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 300000 } }) // 5 password resets per 5 minutes
    ,
    (0, swagger_1.ApiOperation)({
        summary: 'Reset password with token',
        description: 'Reset user password using valid reset token. Rate limited to prevent abuse.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Password reset successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Password has been reset successfully' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid or expired token'
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Too many requests - rate limit exceeded'
    }),
    tslib_1.__param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_v = typeof reset_password_dto_1.ResetPasswordDto !== "undefined" && reset_password_dto_1.ResetPasswordDto) === "function" ? _v : Object]),
    tslib_1.__metadata("design:returntype", typeof (_w = typeof Promise !== "undefined" && Promise) === "function" ? _w : Object)
], AppController.prototype, "resetPassword", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object])
], AppController);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomThrottlerGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const throttler_1 = __webpack_require__(7);
let CustomThrottlerGuard = class CustomThrottlerGuard extends throttler_1.ThrottlerGuard {
    async throwThrottlingException(context, throttlerLimitDetail) {
        const { limit, ttl, tracker } = throttlerLimitDetail;
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        // Get current count from tracker
        const currentCount = await this.getTracker(request);
        // Add rate limit headers
        response.setHeader('X-RateLimit-Limit', limit);
        response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - parseInt(currentCount)));
        response.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());
        // Custom error message based on endpoint
        const url = request.url;
        let message = 'Too many requests. Please try again later.';
        if (url.includes('/password-reset/request')) {
            message = 'Too many password reset requests. Please wait before trying again.';
        }
        else if (url.includes('/login')) {
            message = 'Too many login attempts. Please wait before trying again.';
        }
        else if (url.includes('/register')) {
            message = 'Too many registration attempts. Please wait before trying again.';
        }
        else if (url.includes('/password-reset/reset')) {
            message = 'Too many password reset attempts. Please wait before trying again.';
        }
        throw new throttler_1.ThrottlerException(message);
    }
};
exports.CustomThrottlerGuard = CustomThrottlerGuard;
exports.CustomThrottlerGuard = CustomThrottlerGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], CustomThrottlerGuard);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(5);
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
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(14);
const shared_1 = __webpack_require__(15);
const notification_client_1 = __webpack_require__(59);
const user_entity_1 = __webpack_require__(60);
const vendeur_entity_1 = __webpack_require__(62);
const refresh_token_entity_1 = __webpack_require__(63);
const confermateur_entity_1 = __webpack_require__(64);
const password_reset_token_entity_1 = __webpack_require__(65);
const bcrypt = tslib_1.__importStar(__webpack_require__(48));
const jwt_1 = __webpack_require__(26);
const crypto = tslib_1.__importStar(__webpack_require__(47));
let AuthService = class AuthService {
    constructor(userRepo, vendeurRepo, refreshRepo, confermateurRepo, passwordResetRepo, emailService, notificationClient, jwtService) {
        this.userRepo = userRepo;
        this.vendeurRepo = vendeurRepo;
        this.refreshRepo = refreshRepo;
        this.confermateurRepo = confermateurRepo;
        this.passwordResetRepo = passwordResetRepo;
        this.emailService = emailService;
        this.notificationClient = notificationClient;
        this.jwtService = jwtService;
        // Map of confermateur userId -> set of vendeur userIds they manage (temp until relation is added in persistence layer)
        this.confermateurVendeurs = new Map();
        this.jwtSecret = (() => {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('Missing required environment variable JWT_SECRET');
            }
            return secret;
        })();
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
        if (saved.role === user_entity_1.UserRole.VENDEUR) {
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
    async sendWelcomeEmailAsync(email, firstName) {
        try {
            await this.emailService.sendWelcomeEmail({ email, firstName });
            console.log(`Welcome email sent successfully to ${email}`);
        }
        catch (error) {
            // Log error but don't fail the registration
            console.error(`Failed to send welcome email to ${email}:`, error.message);
        }
    }
    // Private method to send password reset email asynchronously
    async sendPasswordResetEmailAsync(email, token, firstName) {
        try {
            await this.emailService.sendPasswordResetEmail({ email, resetToken: token, firstName });
            console.log(`Password reset email sent successfully to ${email}`);
        }
        catch (error) {
            // Log error but don't fail the request for security reasons
            console.error('Failed to send password reset email:', error.message);
            console.error('This may be due to email service being unavailable or misconfigured');
        }
    }
    async login(loginDto) {
        const user = await this.userRepo.findOne({ where: { email: loginDto.email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const passwordMatches = await user.validatePassword(loginDto.password);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
        const accessTokenPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            type: 'access'
        };
        // Include vendor ID if user is a vendor
        if (user.role === user_entity_1.UserRole.VENDEUR && vendorId) {
            accessTokenPayload.vendorId = vendorId;
        }
        // Include confirmateur ID if user is a confirmateur
        if (user.role === user_entity_1.UserRole.CONFERMATEUR && confirmateurId) {
            accessTokenPayload.confirmateurId = confirmateurId;
        }
        const accessToken = await this.jwtService.signAsync(accessTokenPayload, { secret: this.jwtSecret, expiresIn: this.accessTokenExpiry });
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
            expiresIn: accessTokenExpirySeconds,
            vendorId,
            confirmateurId
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
        // Get vendor/confirmateur IDs first
        const { vendorId, confirmateurId } = await this.getVendorAndConfirmateurIds(user.id);
        // Generate new access token with vendor/confirmateur IDs
        const accessTokenPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            type: 'access'
        };
        // Include vendor ID if user is a vendor
        if (user.role === user_entity_1.UserRole.VENDEUR && vendorId) {
            accessTokenPayload.vendorId = vendorId;
        }
        // Include confirmateur ID if user is a confirmateur
        if (user.role === user_entity_1.UserRole.CONFERMATEUR && confirmateurId) {
            accessTokenPayload.confirmateurId = confirmateurId;
        }
        const accessToken = await this.jwtService.signAsync(accessTokenPayload, { secret: this.jwtSecret, expiresIn: this.accessTokenExpiry });
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
            expiresIn: accessTokenExpirySeconds,
            vendorId,
            confirmateurId
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
    async getVendorAndConfirmateurIds(userId) {
        const [vendeur, confermateur] = await Promise.all([
            this.vendeurRepo.findOne({ where: { idUser: userId } }),
            this.confermateurRepo.findOne({ where: { idUser: userId } })
        ]);
        return {
            vendorId: vendeur?.id,
            confirmateurId: confermateur?.id
        };
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
    // Password reset functionality
    async requestPasswordReset(email) {
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
        await this.passwordResetRepo.update({ userId: user.id, isActive: true }, { isActive: false });
        // Generate new password reset token
        const token = this.generatePasswordResetToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
        // Save password reset token
        await this.passwordResetRepo.save(this.passwordResetRepo.create({
            token,
            userId: user.id,
            expiresAt,
            isActive: true,
        }));
        // Send email with reset link asynchronously
        this.sendPasswordResetEmailAsync(user.email, token, user.firstName);
        return {
            message: 'If an account with this email exists, a password reset link has been sent.',
            email
        };
    }
    async confirmPasswordResetToken(token) {
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
    async resetPassword(token, newPassword) {
        // Find active password reset token
        const resetToken = await this.passwordResetRepo.findOne({
            where: { token, isActive: true },
            relations: ['user']
        });
        if (!resetToken) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        // Check if token is expired
        if (new Date() > resetToken.expiresAt) {
            await this.passwordResetRepo.update({ token }, { isActive: false });
            throw new common_1.BadRequestException('Reset token has expired');
        }
        // Check if token has already been used
        if (resetToken.usedAt) {
            throw new common_1.BadRequestException('Reset token has already been used');
        }
        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        // Update user password
        await this.userRepo.update(resetToken.userId, { password: hashedPassword });
        // Mark token as used
        await this.passwordResetRepo.update({ token }, { usedAt: new Date(), isActive: false });
        // Invalidate all refresh tokens for security
        await this.refreshRepo.delete({ userId: resetToken.userId });
        return { message: 'Password has been reset successfully' };
    }
    generatePasswordResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    // Clean up expired password reset tokens (call this periodically)
    async cleanupExpiredPasswordResetTokens() {
        const now = new Date();
        await this.passwordResetRepo
            .createQueryBuilder()
            .update()
            .set({ isActive: false })
            .where('expiresAt < :now', { now })
            .execute();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(vendeur_entity_1.Vendeur)),
    tslib_1.__param(2, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    tslib_1.__param(3, (0, typeorm_1.InjectRepository)(confermateur_entity_1.Confermateur)),
    tslib_1.__param(4, (0, typeorm_1.InjectRepository)(password_reset_token_entity_1.PasswordResetToken)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof shared_1.EmailService !== "undefined" && shared_1.EmailService) === "function" ? _f : Object, typeof (_g = typeof notification_client_1.NotificationClient !== "undefined" && notification_client_1.NotificationClient) === "function" ? _g : Object, typeof (_h = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _h : Object])
], AuthService);


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(5);
tslib_1.__exportStar(__webpack_require__(16), exports);
tslib_1.__exportStar(__webpack_require__(17), exports);
tslib_1.__exportStar(__webpack_require__(19), exports);
tslib_1.__exportStar(__webpack_require__(39), exports);
tslib_1.__exportStar(__webpack_require__(20), exports);
tslib_1.__exportStar(__webpack_require__(21), exports);
tslib_1.__exportStar(__webpack_require__(38), exports);
tslib_1.__exportStar(__webpack_require__(40), exports);
tslib_1.__exportStar(__webpack_require__(42), exports);
tslib_1.__exportStar(__webpack_require__(36), exports);
tslib_1.__exportStar(__webpack_require__(23), exports);
tslib_1.__exportStar(__webpack_require__(32), exports);
tslib_1.__exportStar(__webpack_require__(33), exports);
tslib_1.__exportStar(__webpack_require__(37), exports);
tslib_1.__exportStar(__webpack_require__(43), exports);
tslib_1.__exportStar(__webpack_require__(45), exports);
tslib_1.__exportStar(__webpack_require__(25), exports);
tslib_1.__exportStar(__webpack_require__(30), exports);
tslib_1.__exportStar(__webpack_require__(28), exports);
tslib_1.__exportStar(__webpack_require__(31), exports);
tslib_1.__exportStar(__webpack_require__(46), exports);
tslib_1.__exportStar(__webpack_require__(49), exports);
tslib_1.__exportStar(__webpack_require__(50), exports);
tslib_1.__exportStar(__webpack_require__(52), exports);
tslib_1.__exportStar(__webpack_require__(53), exports);
tslib_1.__exportStar(__webpack_require__(57), exports);
tslib_1.__exportStar(__webpack_require__(58), exports);


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const database_module_1 = __webpack_require__(17);
const database_service_1 = __webpack_require__(19);
const email_module_1 = __webpack_require__(20);
const config_module_1 = __webpack_require__(23);
const auth_module_1 = __webpack_require__(25);
const rate_limit_guard_1 = __webpack_require__(32);
const logging_interceptor_1 = __webpack_require__(33);
const response_interceptor_1 = __webpack_require__(37);
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, email_module_1.EmailModule, config_module_1.AppConfigModule, auth_module_1.AuthModule],
        providers: [
            database_service_1.DatabaseService,
            rate_limit_guard_1.SharedRateLimitGuard,
            logging_interceptor_1.LoggingInterceptor,
            response_interceptor_1.ResponseInterceptor,
        ],
        exports: [
            database_module_1.DatabaseModule,
            database_service_1.DatabaseService,
            email_module_1.EmailModule,
            config_module_1.AppConfigModule,
            auth_module_1.AuthModule,
            rate_limit_guard_1.SharedRateLimitGuard,
            logging_interceptor_1.LoggingInterceptor,
            response_interceptor_1.ResponseInterceptor,
        ],
    })
], SharedModule);


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const config_1 = __webpack_require__(18);
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
/* 18 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(14);
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
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const email_service_1 = __webpack_require__(21);
let EmailModule = class EmailModule {
};
exports.EmailModule = EmailModule;
exports.EmailModule = EmailModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [email_service_1.EmailService],
        exports: [email_service_1.EmailService],
    })
], EmailModule);


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var EmailService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const nodemailer = tslib_1.__importStar(__webpack_require__(22));
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        this.initializeTransporter();
    }
    initializeTransporter() {
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
            // Use MailHog for development
            this.transporter = nodemailer.createTransport({
                host: process.env.MAILHOG_HOST || 'localhost',
                port: parseInt(process.env.MAILHOG_PORT || '1025'),
                secure: false,
                auth: null,
            });
        }
        else {
            // Use production email service (SMTP, SendGrid, etc.)
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: process.env.FROM_EMAIL || 'noreply@youfizz.com',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };
            const result = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully to ${options.to}. MessageId: ${result.messageId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${options.to}:`, error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
    async sendPasswordResetEmail(data) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${data.resetToken}`;
        const emailContent = this.generatePasswordResetEmailTemplate(data, resetUrl);
        await this.sendEmail({
            to: data.email,
            subject: 'Password Reset Request - YouFizz',
            html: emailContent.html,
            text: emailContent.text,
        });
    }
    async sendWelcomeEmail(data) {
        const emailContent = this.generateWelcomeEmailTemplate(data);
        await this.sendEmail({
            to: data.email,
            subject: 'Welcome to YouFizz!',
            html: emailContent.html,
            text: emailContent.text,
        });
    }
    async sendNotificationEmail(data) {
        const emailContent = this.generateNotificationEmailTemplate(data);
        await this.sendEmail({
            to: data.email,
            subject: data.subject,
            html: emailContent.html,
            text: emailContent.text,
        });
    }
    generatePasswordResetEmailTemplate(data, resetUrl) {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">YouFizz</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hello ${data.firstName || 'there'},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You have requested to reset your password for your YouFizz account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.4;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} YouFizz. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
        const text = `
      Password Reset Request - YouFizz
      
      Hello ${data.firstName || 'there'},
      
      You have requested to reset your password for your YouFizz account. 
      Click the link below to reset your password:
      
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email. 
      Your password will remain unchanged.
      
      Best regards,
      The YouFizz Team
    `;
        return { html, text };
    }
    generateWelcomeEmailTemplate(data) {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to YouFizz</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">YouFizz</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to YouFizz!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hello ${data.firstName || 'there'},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with YouFizz! We're excited to have you on board and look forward to providing you with an amazing experience.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You can now start exploring our platform and all the features we have to offer. If you have any questions or need assistance, our support team is here to help.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Getting Started</h3>
              <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Complete your profile setup</li>
                <li>Explore our features and services</li>
                <li>Connect with other users</li>
                <li>Check out our help center for tips and guides</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We're committed to providing you with the best possible experience. If you have any feedback or suggestions, we'd love to hear from you!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin: 0;">
                Best regards,<br>
                <strong>The YouFizz Team</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} YouFizz. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
        const text = `
      Welcome to YouFizz!
      
      Hello ${data.firstName || 'there'},
      
      Thank you for registering with YouFizz! We're excited to have you on board and look forward to providing you with an amazing experience.
      
      You can now start exploring our platform and all the features we have to offer. If you have any questions or need assistance, our support team is here to help.
      
      Getting Started:
      - Complete your profile setup
      - Explore our features and services
      - Connect with other users
      - Check out our help center for tips and guides
      
      We're committed to providing you with the best possible experience. If you have any feedback or suggestions, we'd love to hear from you!
      
      Best regards,
      The YouFizz Team
    `;
        return { html, text };
    }
    generateNotificationEmailTemplate(data) {
        // Generic notification template - can be extended based on template type
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">YouFizz</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">${data.subject}</h2>
            
            <div style="color: #666; line-height: 1.6;">
              ${data.data.content || 'You have a new notification from YouFizz.'}
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} YouFizz. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
        const text = `
      ${data.subject}
      
      ${data.data.content || 'You have a new notification from YouFizz.'}
      
      Best regards,
      The YouFizz Team
    `;
        return { html, text };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], EmailService);


/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("nodemailer");

/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppConfigModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(18);
const app_config_1 = __webpack_require__(24);
let AppConfigModule = class AppConfigModule {
};
exports.AppConfigModule = AppConfigModule;
exports.AppConfigModule = AppConfigModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [
                    app_config_1.databaseConfig,
                    app_config_1.emailConfig,
                    app_config_1.redisConfig,
                    app_config_1.rateLimitConfig,
                    app_config_1.serviceConfig,
                    app_config_1.authServiceConfig,
                    app_config_1.userServiceConfig,
                    app_config_1.notificationServiceConfig,
                    app_config_1.apiGatewayConfig,
                ],
                envFilePath: ['.env.local', '.env'],
            }),
        ],
        exports: [config_1.ConfigModule],
    })
], AppConfigModule);


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apiGatewayConfig = exports.notificationServiceConfig = exports.userServiceConfig = exports.authServiceConfig = exports.serviceConfig = exports.rateLimitConfig = exports.redisConfig = exports.emailConfig = exports.databaseConfig = void 0;
const config_1 = __webpack_require__(18);
exports.databaseConfig = (0, config_1.registerAs)('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'you_fizz',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '10', 10),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10),
}));
exports.emailConfig = (0, config_1.registerAs)('email', () => ({
    host: process.env.SMTP_HOST || process.env.MAILHOG_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || process.env.MAILHOG_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || 'noreply@youfizz.com',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
exports.redisConfig = (0, config_1.registerAs)('redis', () => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
}));
exports.rateLimitConfig = (0, config_1.registerAs)('rateLimit', () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return {
        short: {
            ttl: 1000,
            limit: isDevelopment ? 10 : 3,
        },
        medium: {
            ttl: 10000,
            limit: isDevelopment ? 50 : 20,
        },
        long: {
            ttl: 60000,
            limit: isDevelopment ? 200 : 100,
        },
        authStrict: {
            ttl: 300000,
            limit: isDevelopment ? 10 : 5,
        },
        passwordReset: {
            ttl: 300000,
            limit: isDevelopment ? 5 : 3,
        },
        loginAttempts: {
            ttl: 900000,
            limit: isDevelopment ? 20 : 10,
        },
    };
});
exports.serviceConfig = (0, config_1.registerAs)('service', () => ({
    name: process.env.SERVICE_NAME || 'you-fizz',
    port: parseInt(process.env.PORT || '3000', 10),
    microservicePort: process.env.MICROSERVICE_PORT ? parseInt(process.env.MICROSERVICE_PORT, 10) : undefined,
    environment: process.env.NODE_ENV || 'development',
}));
// Service-specific configurations
exports.authServiceConfig = (0, config_1.registerAs)('authService', () => ({
    port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
    microservicePort: parseInt(process.env.AUTH_MICROSERVICE_PORT || '4001', 10),
    jwtSecret: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('Missing required environment variable JWT_SECRET');
        }
        return secret;
    })(),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
}));
exports.userServiceConfig = (0, config_1.registerAs)('userService', () => ({
    port: parseInt(process.env.USER_SERVICE_PORT || '3002', 10),
    microservicePort: parseInt(process.env.USER_MICROSERVICE_PORT || '3002', 10),
}));
exports.notificationServiceConfig = (0, config_1.registerAs)('notificationService', () => ({
    port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3003', 10),
    microservicePort: parseInt(process.env.NOTIFICATION_MICROSERVICE_PORT || '3003', 10),
}));
exports.apiGatewayConfig = (0, config_1.registerAs)('apiGateway', () => ({
    port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
}));


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(26);
const passport_1 = __webpack_require__(27);
const config_1 = __webpack_require__(18);
const jwt_strategy_1 = __webpack_require__(28);
const jwt_guard_1 = __webpack_require__(30);
const token_blacklist_service_1 = __webpack_require__(31);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('authService.jwtSecret'),
                    signOptions: {
                        expiresIn: (configService.get('authService.jwtExpiresIn') || '1h'),
                        algorithm: 'HS256',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [jwt_strategy_1.JwtStrategy, jwt_guard_1.JwtAuthGuard, token_blacklist_service_1.TokenBlacklistService],
        exports: [passport_1.PassportModule, jwt_1.JwtModule, jwt_guard_1.JwtAuthGuard, token_blacklist_service_1.TokenBlacklistService],
    })
], AuthModule);


/***/ }),
/* 26 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 27 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(27);
const passport_jwt_1 = __webpack_require__(29);
const config_1 = __webpack_require__(18);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService) {
        const secret = configService.get('authService.jwtSecret');
        if (!secret) {
            throw new Error('JWT secret is not configured');
        }
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
            algorithms: ['HS256'],
        });
        this.configService = configService;
    }
    async validate(payload) {
        // Validate token type
        if (payload.type !== 'access') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        // Check if token is blacklisted (would need Redis/DB check in production)
        // For now, we'll trust the JWT signature validation
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            jti: payload.jti,
            vendorId: payload.vendorId,
            confirmateurId: payload.confirmateurId,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),
/* 29 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(27);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenBlacklistService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(18);
let TokenBlacklistService = class TokenBlacklistService {
    constructor(configService) {
        this.configService = configService;
        this.blacklistedTokens = new Map();
    }
    async blacklistToken(jti, userId, reason = 'logout') {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Keep blacklist for 24 hours
        this.blacklistedTokens.set(jti, {
            jti,
            userId,
            expiresAt,
            reason,
        });
        // Clean up expired tokens periodically
        this.cleanupExpiredTokens();
    }
    async isTokenBlacklisted(jti) {
        const token = this.blacklistedTokens.get(jti);
        if (!token)
            return false;
        if (token.expiresAt < new Date()) {
            this.blacklistedTokens.delete(jti);
            return false;
        }
        return true;
    }
    async blacklistUserTokens(userId, reason = 'logout') {
        for (const [jti, token] of this.blacklistedTokens.entries()) {
            if (token.userId === userId) {
                token.reason = reason;
            }
        }
    }
    cleanupExpiredTokens() {
        const now = new Date();
        for (const [jti, token] of this.blacklistedTokens.entries()) {
            if (token.expiresAt < now) {
                this.blacklistedTokens.delete(jti);
            }
        }
    }
    // For production, this should use Redis or database
    async getBlacklistedTokens() {
        this.cleanupExpiredTokens();
        return Array.from(this.blacklistedTokens.values());
    }
};
exports.TokenBlacklistService = TokenBlacklistService;
exports.TokenBlacklistService = TokenBlacklistService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], TokenBlacklistService);


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedRateLimitGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const throttler_1 = __webpack_require__(7);
const config_1 = __webpack_require__(18);
let SharedRateLimitGuard = class SharedRateLimitGuard {
    constructor(configService) {
        this.configService = configService;
    }
    async canActivate(context) {
        // This is a simplified rate limiting guard
        // In a real implementation, you would integrate with a proper rate limiting service
        // For now, we'll just return true to allow all requests
        return true;
    }
    async throwThrottlingException(context, throttlerLimitDetail) {
        const { limit, ttl, tracker } = throttlerLimitDetail;
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        // Add rate limit headers
        response.setHeader('X-RateLimit-Limit', limit);
        response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - 0));
        response.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());
        // Custom error message based on endpoint
        const url = request.url;
        const method = request.method;
        let message = 'Too many requests. Please try again later.';
        // Service-specific error messages
        if (url.includes('/password-reset/request')) {
            message = 'Too many password reset requests. Please wait before trying again.';
        }
        else if (url.includes('/login')) {
            message = 'Too many login attempts. Please wait before trying again.';
        }
        else if (url.includes('/register')) {
            message = 'Too many registration attempts. Please wait before trying again.';
        }
        else if (url.includes('/password-reset/reset')) {
            message = 'Too many password reset attempts. Please wait before trying again.';
        }
        else if (url.includes('/email/')) {
            message = 'Too many email requests. Please wait before trying again.';
        }
        else if (method === 'POST' && url.includes('/api/')) {
            message = 'Too many requests to this endpoint. Please wait before trying again.';
        }
        throw new throttler_1.ThrottlerException(message);
    }
};
exports.SharedRateLimitGuard = SharedRateLimitGuard;
exports.SharedRateLimitGuard = SharedRateLimitGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], SharedRateLimitGuard);


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const operators_1 = __webpack_require__(34);
const rxjs_1 = __webpack_require__(35);
const logging_util_1 = __webpack_require__(36);
let LoggingInterceptor = class LoggingInterceptor {
    constructor() {
        this.logger = new logging_util_1.StructuredLogger('HTTP');
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url, ip } = request;
        const userAgent = request.get('User-Agent') || '';
        const requestId = this.generateRequestId();
        // Add request ID to request object for use in other parts of the application
        request.requestId = requestId;
        const startTime = Date.now();
        this.logger.logRequest(method, url, undefined, requestId);
        return next.handle().pipe((0, operators_1.tap)(() => {
            const duration = Date.now() - startTime;
            const statusCode = response.statusCode;
            this.logger.logResponse(method, url, statusCode, duration, undefined, requestId);
        }), (0, operators_1.catchError)((error) => {
            const duration = Date.now() - startTime;
            const statusCode = error.status || 500;
            this.logger.logError(error, `${method} ${url}`, undefined, requestId);
            this.logger.logResponse(method, url, statusCode, duration, undefined, requestId);
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);


/***/ }),
/* 34 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 35 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.globalLogger = exports.StructuredLogger = void 0;
exports.LogOperation = LogOperation;
const common_1 = __webpack_require__(1);
class StructuredLogger {
    constructor(context = 'Application', logContext = {}) {
        this.logger = new common_1.Logger(context);
        this.context = logContext;
    }
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    formatMessage(message, context) {
        const mergedContext = { ...this.context, ...context };
        const contextString = Object.keys(mergedContext).length > 0
            ? ` [${JSON.stringify(mergedContext)}]`
            : '';
        return `${message}${contextString}`;
    }
    log(message, context) {
        this.logger.log(this.formatMessage(message, context));
    }
    error(message, trace, context) {
        this.logger.error(this.formatMessage(message, context), trace);
    }
    warn(message, context) {
        this.logger.warn(this.formatMessage(message, context));
    }
    debug(message, context) {
        this.logger.debug(this.formatMessage(message, context));
    }
    verbose(message, context) {
        this.logger.verbose(this.formatMessage(message, context));
    }
    // Request/Response logging
    logRequest(method, url, userId, requestId) {
        this.log(`Incoming ${method} request to ${url}`, {
            operation: 'request',
            method,
            url,
            userId,
            requestId,
        });
    }
    logResponse(method, url, statusCode, duration, userId, requestId) {
        this.log(`Outgoing ${method} response from ${url} - ${statusCode} (${duration}ms)`, {
            operation: 'response',
            method,
            url,
            statusCode,
            duration,
            userId,
            requestId,
        });
    }
    // Business operation logging
    logOperation(operation, details, userId) {
        this.log(`Operation: ${operation}`, {
            operation,
            details,
            userId,
        });
    }
    // Error logging with context
    logError(error, operation, userId, requestId) {
        this.error(`Error in ${operation || 'operation'}: ${error.message}`, error.stack, {
            operation,
            userId,
            requestId,
            errorName: error.name,
        });
    }
}
exports.StructuredLogger = StructuredLogger;
// Global logger instance
exports.globalLogger = new StructuredLogger('YouFizz');
// Logging decorator for methods
function LogOperation(operation) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        const logger = new StructuredLogger(target.constructor.name);
        descriptor.value = async function (...args) {
            const startTime = Date.now();
            logger.logOperation(`${operation} started`, { args: args.length });
            try {
                const result = await method.apply(this, args);
                const duration = Date.now() - startTime;
                logger.logOperation(`${operation} completed`, { duration });
                return result;
            }
            catch (error) {
                const duration = Date.now() - startTime;
                logger.logError(error, operation);
                throw error;
            }
        };
    };
}


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResponseInterceptor = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const operators_1 = __webpack_require__(34);
const response_util_1 = __webpack_require__(38);
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => {
            // If data is already an ApiResponse, return it as is
            if (data && typeof data === 'object' && 'success' in data) {
                return data;
            }
            // If data is null or undefined, return success response
            if (data === null || data === undefined) {
                return response_util_1.ApiResponse.success('Operation completed successfully');
            }
            // Wrap data in ApiResponse
            return response_util_1.ApiResponse.success('Operation completed successfully', data);
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginatedResponse = exports.ApiResponse = void 0;
const tslib_1 = __webpack_require__(5);
const swagger_1 = __webpack_require__(9);
class ApiResponse {
    constructor(success, message, data, error) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }
    static success(message, data) {
        return new ApiResponse(true, message, data);
    }
    static error(message, error) {
        return new ApiResponse(false, message, undefined, error);
    }
}
exports.ApiResponse = ApiResponse;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indicates if the request was successful' }),
    tslib_1.__metadata("design:type", Boolean)
], ApiResponse.prototype, "success", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message' }),
    tslib_1.__metadata("design:type", String)
], ApiResponse.prototype, "message", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response data' }),
    tslib_1.__metadata("design:type", Object)
], ApiResponse.prototype, "data", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error details if any' }),
    tslib_1.__metadata("design:type", String)
], ApiResponse.prototype, "error", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of the response' }),
    tslib_1.__metadata("design:type", String)
], ApiResponse.prototype, "timestamp", void 0);
class PaginatedResponse extends ApiResponse {
    constructor(message, data, page, limit, total) {
        super(true, message, data);
        this.pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
}
exports.PaginatedResponse = PaginatedResponse;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pagination metadata' }),
    tslib_1.__metadata("design:type", Object)
], PaginatedResponse.prototype, "pagination", void 0);


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseEntity = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(14);
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
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VALIDATION_PATTERNS = exports.getGlobalValidationPipe = exports.IsValidLimit = exports.IsValidPagination = exports.IsValidUUID = exports.IsValidName = exports.IsStrongPassword = exports.IsValidEmail = void 0;
const class_validator_1 = __webpack_require__(41);
// Common validation decorators
const IsValidEmail = () => (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' });
exports.IsValidEmail = IsValidEmail;
const IsStrongPassword = () => [
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
];
exports.IsStrongPassword = IsStrongPassword;
const IsValidName = (fieldName = 'Name') => [
    (0, class_validator_1.IsString)({ message: `${fieldName} must be a string` }),
    (0, class_validator_1.MinLength)(1, { message: `${fieldName} must be at least 1 character long` }),
];
exports.IsValidName = IsValidName;
const IsValidUUID = (fieldName = 'ID') => (0, class_validator_1.IsUUID)(4, { message: `${fieldName} must be a valid UUID` });
exports.IsValidUUID = IsValidUUID;
const IsValidPagination = () => [
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Page must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Page must be at least 1' }),
];
exports.IsValidPagination = IsValidPagination;
const IsValidLimit = (maxLimit = 100) => [
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Limit must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Limit must be at least 1' }),
    (0, class_validator_1.Max)(maxLimit, { message: `Limit cannot exceed ${maxLimit}` }),
];
exports.IsValidLimit = IsValidLimit;
// Global validation pipe configuration
const getGlobalValidationPipe = () => ({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
        enableImplicitConversion: true,
    },
    validationError: {
        target: false,
        value: false,
    },
});
exports.getGlobalValidationPipe = getGlobalValidationPipe;
// Common validation patterns
exports.VALIDATION_PATTERNS = {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]+$/,
};


/***/ }),
/* 41 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ErrorHandler = exports.ExternalServiceError = exports.DatabaseError = exports.RateLimitError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
const common_1 = __webpack_require__(1);
class AppError extends Error {
    constructor(message, statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, common_1.HttpStatus.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, common_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, common_1.HttpStatus.FORBIDDEN);
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, common_1.HttpStatus.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, common_1.HttpStatus.TOO_MANY_REQUESTS);
    }
}
exports.RateLimitError = RateLimitError;
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.DatabaseError = DatabaseError;
class ExternalServiceError extends AppError {
    constructor(service, message = 'External service error') {
        super(`${service}: ${message}`, common_1.HttpStatus.BAD_GATEWAY);
    }
}
exports.ExternalServiceError = ExternalServiceError;
// Global error handler utility
class ErrorHandler {
    static handle(error) {
        this.logger.error('Error occurred:', error);
        if (error instanceof AppError) {
            return new common_1.HttpException({
                success: false,
                message: error.message,
                error: error.constructor.name,
                timestamp: new Date().toISOString(),
            }, error.statusCode);
        }
        // Handle known error types
        if (error.name === 'ValidationError') {
            return new common_1.HttpException({
                success: false,
                message: 'Validation failed',
                error: error.message,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (error.name === 'CastError') {
            return new common_1.HttpException({
                success: false,
                message: 'Invalid data format',
                error: 'Invalid ID format',
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        // Default error
        return new common_1.HttpException({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
            timestamp: new Date().toISOString(),
        }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    static logError(error, context) {
        const contextMessage = context ? `[${context}] ` : '';
        this.logger.error(`${contextMessage}Error:`, error.stack);
    }
}
exports.ErrorHandler = ErrorHandler;
ErrorHandler.logger = new common_1.Logger(ErrorHandler.name);


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestUtils = void 0;
const testing_1 = __webpack_require__(44);
const common_1 = __webpack_require__(1);
const config_module_1 = __webpack_require__(23);
class TestUtils {
    static async createTestingModule(moduleMetadata) {
        return testing_1.Test.createTestingModule({
            ...moduleMetadata,
            imports: [
                ...(moduleMetadata.imports || []),
                config_module_1.AppConfigModule,
            ],
        }).compile();
    }
    static async createTestApp(module) {
        const app = module.createNestApplication();
        // Apply global validation pipe
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        await app.init();
        return app;
    }
    static async closeTestApp(app) {
        await app.close();
    }
    // Mock data generators
    static generateMockUser(overrides = {}) {
        return {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'guest',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    static generateMockEmailData(overrides = {}) {
        return {
            email: 'test@example.com',
            firstName: 'Test',
            ...overrides,
        };
    }
    static generateMockPasswordResetData(overrides = {}) {
        return {
            email: 'test@example.com',
            resetToken: 'mock-reset-token-123',
            firstName: 'Test',
            ...overrides,
        };
    }
    // Database test utilities
    static async clearDatabase(app) {
        // This would be implemented based on your database setup
        // For now, it's a placeholder
    }
    static async seedTestData(app) {
        // This would be implemented based on your seeding needs
        // For now, it's a placeholder
    }
}
exports.TestUtils = TestUtils;


/***/ }),
/* 44 */
/***/ ((module) => {

module.exports = require("@nestjs/testing");

/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_module_1 = __webpack_require__(23);
let TestModule = class TestModule {
};
exports.TestModule = TestModule;
exports.TestModule = TestModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [config_module_1.AppConfigModule],
        exports: [config_module_1.AppConfigModule],
    })
], TestModule);


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const crypto = tslib_1.__importStar(__webpack_require__(47));
const bcrypt = tslib_1.__importStar(__webpack_require__(48));
let RefreshTokenService = class RefreshTokenService {
    constructor(refreshTokenRepo) {
        this.refreshTokenRepo = refreshTokenRepo;
    }
    async generateRefreshToken(userId) {
        // Generate secure random token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(rawToken, 12);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        await this.refreshTokenRepo.save({
            token: hashedToken,
            userId,
            expiresAt,
            isActive: true,
        });
        return { token: rawToken, expiresAt };
    }
    async validateAndRotateToken(rawToken) {
        const tokens = await this.refreshTokenRepo.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
        let validToken = null;
        // Find the token by comparing hashes
        for (const token of tokens) {
            if (await bcrypt.compare(rawToken, token.token)) {
                validToken = token;
                break;
            }
        }
        if (!validToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (validToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        // Invalidate the old token
        validToken.isActive = false;
        await this.refreshTokenRepo.save(validToken);
        // Generate new token
        const newRawToken = crypto.randomBytes(32).toString('hex');
        const newHashedToken = await bcrypt.hash(newRawToken, 12);
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);
        await this.refreshTokenRepo.save({
            token: newHashedToken,
            userId: validToken.userId,
            expiresAt: newExpiresAt,
            isActive: true,
        });
        return {
            userId: validToken.userId,
            newToken: newRawToken,
            newExpiresAt,
        };
    }
    async invalidateToken(rawToken) {
        const tokens = await this.refreshTokenRepo.find({
            where: { isActive: true },
        });
        for (const token of tokens) {
            if (await bcrypt.compare(rawToken, token.token)) {
                token.isActive = false;
                await this.refreshTokenRepo.save(token);
                break;
            }
        }
    }
    async invalidateUserTokens(userId) {
        await this.refreshTokenRepo.update({ userId, isActive: true }, { isActive: false });
    }
    async invalidateTokenFamily(familyId) {
        // This method is simplified since we don't have familyId in the entity
        // In a real implementation, you might want to add this field to the entity
        await this.refreshTokenRepo.update({ isActive: true }, { isActive: false });
    }
    async cleanupExpiredTokens() {
        await this.refreshTokenRepo
            .createQueryBuilder()
            .delete()
            .where('expiresAt < :now', { now: new Date() })
            .execute();
    }
};
exports.RefreshTokenService = RefreshTokenService;
exports.RefreshTokenService = RefreshTokenService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [Object])
], RefreshTokenService);


/***/ }),
/* 47 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 48 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var HealthService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(18);
let HealthService = HealthService_1 = class HealthService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(HealthService_1.name);
        this.startTime = Date.now();
    }
    async getHealthStatus() {
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
        const usedMemory = memoryUsage.heapUsed;
        const memoryPercentage = (usedMemory / totalMemory) * 100;
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: this.configService.get('service.name') || 'unknown',
            version: process.env.npm_package_version || '1.0.0',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            memory: {
                used: Math.round(usedMemory / 1024 / 1024), // MB
                total: Math.round(totalMemory / 1024 / 1024), // MB
                percentage: Math.round(memoryPercentage * 100) / 100,
            },
        };
        // Add database health check
        try {
            const dbStart = Date.now();
            // This would be replaced with actual database ping
            health.database = {
                status: 'connected',
                responseTime: Date.now() - dbStart,
            };
        }
        catch (error) {
            health.database = {
                status: 'error',
            };
            health.status = 'error';
        }
        // Add Redis health check
        try {
            const redisStart = Date.now();
            // This would be replaced with actual Redis ping
            health.redis = {
                status: 'connected',
                responseTime: Date.now() - redisStart,
            };
        }
        catch (error) {
            health.redis = {
                status: 'error',
            };
            health.status = 'error';
        }
        return health;
    }
    async getDetailedHealthStatus() {
        const basicHealth = await this.getHealthStatus();
        // Add dependency checks
        const dependencies = {};
        // Check external services
        const services = [
            { name: 'auth', url: `http://localhost:${this.configService.get('authService.port')}/health` },
            { name: 'user', url: `http://localhost:${this.configService.get('userService.port')}/health` },
            { name: 'article', url: `http://localhost:${this.configService.get('articleService.port')}/health` },
            { name: 'cmd', url: `http://localhost:${this.configService.get('cmdService.port')}/health` },
            { name: 'notification', url: `http://localhost:${this.configService.get('notificationService.port')}/health` },
        ];
        for (const service of services) {
            try {
                const start = Date.now();
                // This would be replaced with actual HTTP health check
                dependencies[service.name] = {
                    status: 'ok',
                    responseTime: Date.now() - start,
                };
            }
            catch (error) {
                dependencies[service.name] = {
                    status: 'error',
                    error: error.message,
                };
                basicHealth.status = 'error';
            }
        }
        return {
            ...basicHealth,
            dependencies,
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], HealthService);


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PinoLoggerService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const pino_1 = tslib_1.__importDefault(__webpack_require__(51));
const config_1 = __webpack_require__(18);
let PinoLoggerService = class PinoLoggerService {
    constructor(configService) {
        this.configService = configService;
        const logLevel = this.configService.get('LOG_LEVEL') || 'info';
        const logFormat = this.configService.get('LOG_FORMAT') || 'json';
        const nodeEnv = this.configService.get('NODE_ENV') || 'development';
        const config = {
            level: logLevel,
            formatters: {
                level: (label) => ({ level: label }),
            },
            timestamp: pino_1.default.stdTimeFunctions.isoTime,
            base: {
                service: this.configService.get('service.name') || 'you-fizz',
                version: process.env.npm_package_version || '1.0.0',
                environment: nodeEnv,
            },
        };
        if (logFormat === 'pretty' || nodeEnv === 'development') {
            this.logger = (0, pino_1.default)(config, pino_1.default.destination({
                dest: 1, // stdout
                sync: false,
            }));
        }
        else {
            this.logger = (0, pino_1.default)(config);
        }
    }
    log(message, context) {
        this.logger.info({ context }, message);
    }
    error(message, trace, context) {
        this.logger.error({ context, trace }, message);
    }
    warn(message, context) {
        this.logger.warn({ context }, message);
    }
    debug(message, context) {
        this.logger.debug({ context }, message);
    }
    verbose(message, context) {
        this.logger.trace({ context }, message);
    }
    // Custom methods for structured logging
    logRequest(req, res, responseTime) {
        this.logger.info({
            type: 'request',
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
        }, 'HTTP Request');
    }
    logError(error, context) {
        this.logger.error({
            type: 'error',
            name: error.name,
            message: error.message,
            stack: error.stack,
            context,
        }, 'Application Error');
    }
    logSecurity(event, details) {
        this.logger.warn({
            type: 'security',
            event,
            ...details,
        }, 'Security Event');
    }
    logBusiness(event, details) {
        this.logger.info({
            type: 'business',
            event,
            ...details,
        }, 'Business Event');
    }
};
exports.PinoLoggerService = PinoLoggerService;
exports.PinoLoggerService = PinoLoggerService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], PinoLoggerService);


/***/ }),
/* 51 */
/***/ ((module) => {

module.exports = require("pino");

/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var TracingService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TracingService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(18);
const crypto = tslib_1.__importStar(__webpack_require__(47));
let TracingService = TracingService_1 = class TracingService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TracingService_1.name);
        this.enabled = this.configService.get('TRACING_ENABLED') || false;
    }
    generateTraceId() {
        return crypto.randomBytes(16).toString('hex');
    }
    generateSpanId() {
        return crypto.randomBytes(8).toString('hex');
    }
    createTraceContext(parentContext) {
        return {
            traceId: parentContext?.traceId || this.generateTraceId(),
            spanId: this.generateSpanId(),
            parentSpanId: parentContext?.spanId,
            baggage: parentContext?.baggage || {},
        };
    }
    extractTraceContext(headers) {
        if (!this.enabled)
            return null;
        const traceId = headers['x-trace-id'] || headers['x-request-id'];
        const spanId = headers['x-span-id'];
        const parentSpanId = headers['x-parent-span-id'];
        if (!traceId)
            return null;
        return {
            traceId,
            spanId: spanId || this.generateSpanId(),
            parentSpanId,
            baggage: this.parseBaggage(headers['x-baggage']),
        };
    }
    injectTraceContext(context) {
        if (!this.enabled)
            return {};
        const headers = {
            'x-trace-id': context.traceId,
            'x-span-id': context.spanId,
        };
        if (context.parentSpanId) {
            headers['x-parent-span-id'] = context.parentSpanId;
        }
        if (context.baggage && Object.keys(context.baggage).length > 0) {
            headers['x-baggage'] = this.serializeBaggage(context.baggage);
        }
        return headers;
    }
    parseBaggage(baggageHeader) {
        if (!baggageHeader)
            return {};
        const baggage = {};
        const pairs = baggageHeader.split(',');
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key && value) {
                baggage[key.trim()] = decodeURIComponent(value.trim());
            }
        }
        return baggage;
    }
    serializeBaggage(baggage) {
        return Object.entries(baggage)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join(',');
    }
    logSpan(operation, context, duration, metadata) {
        if (!this.enabled)
            return;
        this.logger.debug({
            type: 'span',
            operation,
            traceId: context.traceId,
            spanId: context.spanId,
            parentSpanId: context.parentSpanId,
            duration,
            metadata,
        }, `Span: ${operation}`);
    }
    logTrace(event, context, metadata) {
        if (!this.enabled)
            return;
        this.logger.debug({
            type: 'trace',
            event,
            traceId: context.traceId,
            spanId: context.spanId,
            metadata,
        }, `Trace: ${event}`);
    }
};
exports.TracingService = TracingService;
exports.TracingService = TracingService = TracingService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], TracingService);


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var MailProviderService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MailProviderService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(18);
const smtp_provider_1 = __webpack_require__(54);
const sendgrid_provider_1 = __webpack_require__(55);
const aws_ses_provider_1 = __webpack_require__(56);
let MailProviderService = MailProviderService_1 = class MailProviderService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailProviderService_1.name);
        const providerType = this.configService.get('MAIL_PROVIDER') || 'smtp';
        const config = this.getProviderConfig(providerType);
        this.provider = this.createProvider(providerType, config);
    }
    getProviderConfig(provider) {
        const baseConfig = {
            provider: provider,
        };
        switch (provider) {
            case 'smtp':
                baseConfig.smtp = {
                    host: this.configService.get('SMTP_HOST') || 'localhost',
                    port: this.configService.get('SMTP_PORT') || 1025,
                    secure: this.configService.get('SMTP_SECURE') || false,
                    auth: this.configService.get('SMTP_USER') ? {
                        user: this.configService.get('SMTP_USER'),
                        pass: this.configService.get('SMTP_PASS'),
                    } : undefined,
                };
                break;
            case 'sendgrid':
                baseConfig.sendgrid = {
                    apiKey: this.configService.get('SENDGRID_API_KEY'),
                };
                break;
            case 'aws-ses':
                baseConfig.aws = {
                    accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
                    secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
                    region: this.configService.get('AWS_REGION') || 'us-east-1',
                };
                break;
            default:
                this.logger.warn(`Unknown mail provider: ${provider}, falling back to SMTP`);
                return this.getProviderConfig('smtp');
        }
        return baseConfig;
    }
    createProvider(provider, config) {
        switch (provider) {
            case 'smtp':
                return new smtp_provider_1.SmtpMailProvider(config);
            case 'sendgrid':
                return new sendgrid_provider_1.SendgridMailProvider(config);
            case 'aws-ses':
                return new aws_ses_provider_1.AwsSesMailProvider(config);
            default:
                this.logger.warn(`Unknown mail provider: ${provider}, falling back to SMTP`);
                return new smtp_provider_1.SmtpMailProvider(this.getProviderConfig('smtp'));
        }
    }
    async send(message) {
        try {
            this.logger.debug(`Sending email to ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`);
            await this.provider.send(message);
            this.logger.log(`Email sent successfully to ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`, error.stack);
            throw error;
        }
    }
    async sendBulk(messages) {
        try {
            this.logger.debug(`Sending ${messages.length} emails in bulk`);
            await this.provider.sendBulk(messages);
            this.logger.log(`Bulk email sent successfully for ${messages.length} messages`);
        }
        catch (error) {
            this.logger.error(`Failed to send bulk emails: ${error.message}`, error.stack);
            throw error;
        }
    }
    validateEmail(email) {
        return this.provider.validateEmail(email);
    }
    getProviderName() {
        return this.provider.getProviderName();
    }
};
exports.MailProviderService = MailProviderService;
exports.MailProviderService = MailProviderService = MailProviderService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], MailProviderService);


/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SmtpMailProvider = void 0;
const tslib_1 = __webpack_require__(5);
const nodemailer = tslib_1.__importStar(__webpack_require__(22));
class SmtpMailProvider {
    constructor(config) {
        this.config = config;
        if (!config.smtp) {
            throw new Error('SMTP configuration is required');
        }
        this.transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            auth: config.smtp.auth,
        });
    }
    async send(message) {
        const mailOptions = {
            from: message.from || process.env.FROM_EMAIL || 'noreply@youfizz.com',
            to: Array.isArray(message.to) ? message.to.join(', ') : message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
            attachments: message.attachments,
        };
        await this.transporter.sendMail(mailOptions);
    }
    async sendBulk(messages) {
        const promises = messages.map(message => this.send(message));
        await Promise.all(promises);
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    getProviderName() {
        return 'SMTP';
    }
}
exports.SmtpMailProvider = SmtpMailProvider;


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SendgridMailProvider = void 0;
class SendgridMailProvider {
    constructor(config) {
        this.config = config;
        if (!config.sendgrid?.apiKey) {
            throw new Error('SendGrid API key is required');
        }
        this.apiKey = config.sendgrid.apiKey;
    }
    async send(message) {
        // This would be implemented with actual SendGrid SDK
        // For now, we'll throw an error indicating it needs implementation
        throw new Error('SendGrid provider not implemented yet');
    }
    async sendBulk(messages) {
        const promises = messages.map(message => this.send(message));
        await Promise.all(promises);
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    getProviderName() {
        return 'SendGrid';
    }
}
exports.SendgridMailProvider = SendgridMailProvider;


/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AwsSesMailProvider = void 0;
class AwsSesMailProvider {
    constructor(providerConfig) {
        this.providerConfig = providerConfig;
        if (!providerConfig.aws) {
            throw new Error('AWS configuration is required');
        }
        this.config = providerConfig.aws;
    }
    async send(message) {
        // This would be implemented with actual AWS SES SDK
        // For now, we'll throw an error indicating it needs implementation
        throw new Error('AWS SES provider not implemented yet');
    }
    async sendBulk(messages) {
        const promises = messages.map(message => this.send(message));
        await Promise.all(promises);
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    getProviderName() {
        return 'AWS SES';
    }
}
exports.AwsSesMailProvider = AwsSesMailProvider;


/***/ }),
/* 57 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var PolicyService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PolicyService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
let PolicyService = PolicyService_1 = class PolicyService {
    constructor() {
        this.logger = new common_1.Logger(PolicyService_1.name);
        this.rolePermissions = new Map();
        this.initializePermissions();
    }
    async initializePermissions() {
        // Initialize default permissions
        const defaultPermissions = [
            { id: 'user:read', name: 'Read User', resource: 'user', action: 'read' },
            { id: 'user:write', name: 'Write User', resource: 'user', action: 'write' },
            { id: 'user:delete', name: 'Delete User', resource: 'user', action: 'delete' },
            { id: 'article:read', name: 'Read Article', resource: 'article', action: 'read' },
            { id: 'article:write', name: 'Write Article', resource: 'article', action: 'write' },
            { id: 'article:delete', name: 'Delete Article', resource: 'article', action: 'delete' },
            { id: 'order:read', name: 'Read Order', resource: 'order', action: 'read' },
            { id: 'order:write', name: 'Write Order', resource: 'order', action: 'write' },
            { id: 'order:delete', name: 'Delete Order', resource: 'order', action: 'delete' },
        ];
        // Initialize default roles
        const defaultRoles = [
            {
                id: 'admin',
                name: 'Administrator',
                permissions: defaultPermissions,
                isActive: true,
            },
            {
                id: 'vendeur',
                name: 'Vendeur',
                permissions: defaultPermissions.filter(p => p.resource === 'article' || p.resource === 'order'),
                isActive: true,
            },
            {
                id: 'confermateur',
                name: 'Confermateur',
                permissions: defaultPermissions.filter(p => p.resource === 'order' && p.action === 'read'),
                isActive: true,
            },
            {
                id: 'guest',
                name: 'Guest',
                permissions: defaultPermissions.filter(p => p.resource === 'article' && p.action === 'read'),
                isActive: true,
            },
        ];
        // Store in memory for now (in production, this would be in database)
        for (const role of defaultRoles) {
            this.rolePermissions.set(role.id, role.permissions);
        }
    }
    async checkPermission(context) {
        try {
            const userPermissions = this.rolePermissions.get(context.user.role);
            if (!userPermissions) {
                this.logger.warn(`No permissions found for role: ${context.user.role}`);
                return false;
            }
            // Check if user has the required permission
            const hasPermission = userPermissions.some(permission => {
                const resourceMatch = permission.resource === context.resource?.constructor?.name?.toLowerCase() ||
                    permission.resource === context.resource;
                const actionMatch = permission.action === context.action;
                return resourceMatch && actionMatch;
            });
            if (!hasPermission) {
                this.logger.warn(`Permission denied for user ${context.user.id} on ${context.resource} ${context.action}`);
                return false;
            }
            // Additional context-based checks
            if (context.resource && typeof context.resource === 'object') {
                return this.checkResourceOwnership(context);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error checking permission: ${error.message}`, error.stack);
            return false;
        }
    }
    checkResourceOwnership(context) {
        // Check if user owns the resource (for user-specific resources)
        if (context.resource && context.resource.userId) {
            return context.resource.userId === context.user.id;
        }
        // Check if user created the resource
        if (context.resource && context.resource.createdBy) {
            return context.resource.createdBy === context.user.id;
        }
        // Admin can access all resources
        if (context.user.role === 'admin') {
            return true;
        }
        // Default to false for security
        return false;
    }
    async getUserPermissions(userId, role) {
        const permissions = this.rolePermissions.get(role) || [];
        this.logger.debug(`Retrieved ${permissions.length} permissions for user ${userId} with role ${role}`);
        return permissions;
    }
    async addPermissionToRole(roleId, permission) {
        const rolePermissions = this.rolePermissions.get(roleId) || [];
        rolePermissions.push(permission);
        this.rolePermissions.set(roleId, rolePermissions);
        this.logger.log(`Added permission ${permission.name} to role ${roleId}`);
    }
    async removePermissionFromRole(roleId, permissionId) {
        const rolePermissions = this.rolePermissions.get(roleId) || [];
        const filteredPermissions = rolePermissions.filter(p => p.id !== permissionId);
        this.rolePermissions.set(roleId, filteredPermissions);
        this.logger.log(`Removed permission ${permissionId} from role ${roleId}`);
    }
    async validateUserRole(userId, requiredRole) {
        // In production, this would validate against the database
        // For now, we'll assume the role is valid if it exists in our map
        return this.rolePermissions.has(requiredRole);
    }
};
exports.PolicyService = PolicyService;
exports.PolicyService = PolicyService = PolicyService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], PolicyService);


/***/ }),
/* 58 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PolicyGuard = exports.RESOURCE_KEY = exports.POLICY_KEY = void 0;
exports.RequirePermission = RequirePermission;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const policy_service_1 = __webpack_require__(57);
exports.POLICY_KEY = 'policy';
exports.RESOURCE_KEY = 'resource';
function RequirePermission(action, resource) {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(exports.POLICY_KEY, { action, resource }, descriptor.value);
    };
}
let PolicyGuard = class PolicyGuard {
    constructor(policyService, reflector) {
        this.policyService = policyService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        // Get policy metadata from the handler
        const policy = this.reflector.get(exports.POLICY_KEY, context.getHandler());
        if (!policy) {
            // No policy defined, allow access
            return true;
        }
        const policyContext = {
            user: {
                id: user.userId || user.sub,
                role: user.role,
                email: user.email,
            },
            resource: request.params.id ? { id: request.params.id } : request.body,
            action: policy.action,
            environment: {
                ip: request.ip,
                userAgent: request.headers['user-agent'],
                timestamp: new Date(),
            },
        };
        const hasPermission = await this.policyService.checkPermission(policyContext);
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`Insufficient permissions to ${policy.action} ${policy.resource || 'resource'}`);
        }
        return true;
    }
};
exports.PolicyGuard = PolicyGuard;
exports.PolicyGuard = PolicyGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof policy_service_1.PolicyService !== "undefined" && policy_service_1.PolicyService) === "function" ? _a : Object, typeof (_b = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _b : Object])
], PolicyGuard);


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var NotificationClient_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationClient = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const axios_1 = __webpack_require__(6);
const rxjs_1 = __webpack_require__(35);
let NotificationClient = NotificationClient_1 = class NotificationClient {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(NotificationClient_1.name);
        this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
    }
    async sendPasswordResetEmail(data) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.notificationServiceUrl}/api/notifications/email/password-reset`, data));
            this.logger.log(`Password reset email sent successfully to ${data.email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${data.email}:`, error.message);
            throw new Error(`Failed to send password reset email: ${error.message}`);
        }
    }
    async sendWelcomeEmail(data) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.notificationServiceUrl}/api/notifications/email/welcome`, data));
            this.logger.log(`Welcome email sent successfully to ${data.email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send welcome email to ${data.email}:`, error.message);
            throw new Error(`Failed to send welcome email: ${error.message}`);
        }
    }
};
exports.NotificationClient = NotificationClient;
exports.NotificationClient = NotificationClient = NotificationClient_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], NotificationClient);


/***/ }),
/* 60 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = exports.UserRole = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(14);
const class_transformer_1 = __webpack_require__(61);
const shared_1 = __webpack_require__(15);
const bcrypt = tslib_1.__importStar(__webpack_require__(48));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["VENDEUR"] = "vendeur";
    UserRole["CONFERMATEUR"] = "confermateur";
    UserRole["GUEST"] = "guest";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User extends shared_1.BaseEntity {
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2b$')) {
            // Hash the password with bcrypt (salt is automatically generated and embedded)
            this.password = await bcrypt.hash(this.password, 12);
            // Clear the separate salt since bcrypt embeds it in the hash
            this.salt = null;
            // Update password changed timestamp
            this.passwordChangedAt = new Date();
        }
    }
    async validatePassword(plainPassword) {
        if (!this.password) {
            return false;
        }
        try {
            // First try standard bcrypt comparison (for new passwords)
            if (await bcrypt.compare(plainPassword, this.password)) {
                return true;
            }
            // If that fails and we have a separate salt, try the old method
            if (this.salt) {
                const oldHash = await bcrypt.hash(plainPassword, this.salt);
                if (oldHash === this.password) {
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    toJSON() {
        const { password, salt, ...user } = this;
        return user;
    }
};
exports.User = User;
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    (0, class_transformer_1.Exclude)({ toPlainOnly: true }),
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
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], User.prototype, "passwordChangedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "salt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], User.prototype, "hashPassword", null);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Unique)(['email'])
], User);


/***/ }),
/* 61 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 62 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Vendeur = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(14);
const shared_1 = __webpack_require__(15);
const user_entity_1 = __webpack_require__(60);
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
/* 63 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshToken = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(14);
const shared_1 = __webpack_require__(15);
const user_entity_1 = __webpack_require__(60);
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
/* 64 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Confermateur = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(14);
const shared_1 = __webpack_require__(15);
const user_entity_1 = __webpack_require__(60);
const vendeur_entity_1 = __webpack_require__(62);
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
/* 65 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PasswordResetToken = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(14);
const shared_1 = __webpack_require__(15);
const user_entity_1 = __webpack_require__(60);
let PasswordResetToken = class PasswordResetToken extends shared_1.BaseEntity {
};
exports.PasswordResetToken = PasswordResetToken;
tslib_1.__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], PasswordResetToken.prototype, "token", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], PasswordResetToken.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], PasswordResetToken.prototype, "expiresAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ default: true }),
    tslib_1.__metadata("design:type", Boolean)
], PasswordResetToken.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], PasswordResetToken.prototype, "usedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object)
], PasswordResetToken.prototype, "user", void 0);
exports.PasswordResetToken = PasswordResetToken = tslib_1.__decorate([
    (0, typeorm_1.Entity)('password_reset_tokens')
], PasswordResetToken);


/***/ }),
/* 66 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDto = void 0;
const tslib_1 = __webpack_require__(5);
const class_validator_1 = __webpack_require__(41);
const swagger_1 = __webpack_require__(9);
const user_entity_1 = __webpack_require__(60);
const swagger_examples_1 = __webpack_require__(67);
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the user. Must be a valid email format and unique across the system.',
        example: swagger_examples_1.AuthTestExamples.registerSuccess.email,
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password for the user account. Must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
        example: swagger_examples_1.AuthTestExamples.registerSuccess.password,
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
    }),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'First name of the user. Optional field for personalization.',
        example: swagger_examples_1.AuthTestExamples.registerSuccess.firstName,
        required: false,
        minLength: 1,
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'First name must be a string' }),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last name of the user. Optional field for personalization.',
        example: swagger_examples_1.AuthTestExamples.registerSuccess.lastName,
        required: false,
        minLength: 1,
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Last name must be a string' }),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role of the user in the system. Determines access permissions and capabilities.',
        enum: user_entity_1.UserRole,
        example: swagger_examples_1.AuthTestExamples.registerSuccess.role,
        required: false,
        enumName: 'UserRole',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_entity_1.UserRole, { message: 'Role must be a valid user role' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.UserRole !== "undefined" && user_entity_1.UserRole) === "function" ? _a : Object)
], CreateUserDto.prototype, "role", void 0);


/***/ }),
/* 67 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestScenarios = exports.ResponseExamples = exports.NotificationTestExamples = exports.AuthTestExamples = void 0;
// Test data examples for Swagger documentation
exports.AuthTestExamples = {
    // User Registration Examples
    registerSuccess: {
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'GUEST'
    },
    registerWithRole: {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
    },
    registerMinimal: {
        email: 'user@example.com',
        password: 'Password123!'
    },
    // Login Examples
    loginSuccess: {
        email: 'john.doe@example.com',
        password: 'SecurePassword123!'
    },
    loginAdmin: {
        email: 'admin@example.com',
        password: 'AdminPassword123!'
    },
    // Password Reset Examples
    passwordResetRequest: {
        email: 'john.doe@example.com'
    },
    passwordResetConfirm: {
        token: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
    },
    passwordResetExecute: {
        token: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
        newPassword: 'NewSecurePassword123!'
    },
    // Refresh Token Examples
    refreshToken: {
        refreshToken: 'def456ghi789jkl012mno345pqr678stu901vwx234yzabc123'
    },
    // User Management Examples
    updateUserRole: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'VENDEUR'
    },
    setUserActive: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isActive: false
    },
    // Error Examples
    validationError: {
        email: 'invalid-email',
        password: '123'
    },
    conflictError: {
        email: 'existing@example.com',
        password: 'Password123!'
    },
    unauthorizedError: {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!'
    }
};
exports.NotificationTestExamples = {
    // Password Reset Email Examples
    passwordResetEmail: {
        email: 'john.doe@example.com',
        resetToken: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
        firstName: 'John'
    },
    // Welcome Email Examples
    welcomeEmail: {
        email: 'newuser@example.com',
        firstName: 'Jane'
    },
    welcomeEmailMinimal: {
        email: 'user@example.com'
    }
};
// Response Examples
exports.ResponseExamples = {
    // Auth Responses
    userResponse: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'GUEST',
        isActive: true,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
    },
    authResponse: {
        user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'GUEST',
            isActive: true,
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'def456ghi789jkl012mno345pqr678stu901vwx234yzabc123',
        tokenType: 'Bearer',
        expiresIn: 900
    },
    passwordResetResponse: {
        message: 'If an account with this email exists, a password reset link has been sent.',
        email: 'john.doe@example.com'
    },
    passwordResetConfirmation: {
        isValid: true,
        email: 'john.doe@example.com',
        expiresAt: '2024-01-15T11:30:00.000Z',
        message: 'Token is valid and ready for password reset'
    },
    passwordResetConfirmationInvalid: {
        isValid: false,
        message: 'Invalid or expired reset token'
    },
    passwordResetSuccess: {
        message: 'Password has been reset successfully'
    },
    // Notification Responses
    emailSent: {
        message: 'Password reset email sent successfully',
        email: 'john.doe@example.com'
    },
    welcomeEmailSent: {
        message: 'Welcome email sent successfully',
        email: 'newuser@example.com'
    },
    // Error Responses
    rateLimitError: {
        message: 'Too many password reset requests. Please wait before trying again.',
        statusCode: 429,
        retryAfter: 300
    },
    validationError: {
        message: ['email must be a valid email address', 'password must be at least 8 characters long'],
        error: 'Bad Request',
        statusCode: 400
    },
    conflictError: {
        message: 'User with this email already exists',
        error: 'Conflict',
        statusCode: 409
    },
    unauthorizedError: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401
    },
    notFoundError: {
        message: 'User not found',
        error: 'Bad Request',
        statusCode: 400
    }
};
// Test Scenarios
exports.TestScenarios = {
    // Complete User Journey
    completeUserJourney: {
        name: 'Complete User Registration and Authentication Journey',
        steps: [
            {
                step: 1,
                action: 'Register new user',
                endpoint: 'POST /register',
                data: exports.AuthTestExamples.registerSuccess,
                expectedStatus: 201,
                expectedResponse: 'UserResponseDto'
            },
            {
                step: 2,
                action: 'Login with credentials',
                endpoint: 'POST /login',
                data: exports.AuthTestExamples.loginSuccess,
                expectedStatus: 200,
                expectedResponse: 'AuthResponseDto'
            },
            {
                step: 3,
                action: 'Refresh access token',
                endpoint: 'POST /refresh',
                data: exports.AuthTestExamples.refreshToken,
                expectedStatus: 200,
                expectedResponse: 'AuthResponseDto'
            },
            {
                step: 4,
                action: 'Logout',
                endpoint: 'POST /logout',
                data: exports.AuthTestExamples.refreshToken,
                expectedStatus: 200,
                expectedResponse: '{ message: string }'
            }
        ]
    },
    // Password Reset Journey
    passwordResetJourney: {
        name: 'Complete Password Reset Journey',
        steps: [
            {
                step: 1,
                action: 'Request password reset',
                endpoint: 'POST /password-reset/request',
                data: exports.AuthTestExamples.passwordResetRequest,
                expectedStatus: 200,
                expectedResponse: 'PasswordResetResponseDto'
            },
            {
                step: 2,
                action: 'Confirm reset token',
                endpoint: 'POST /password-reset/confirm',
                data: exports.AuthTestExamples.passwordResetConfirm,
                expectedStatus: 200,
                expectedResponse: 'PasswordResetConfirmationResponseDto'
            },
            {
                step: 3,
                action: 'Reset password',
                endpoint: 'POST /password-reset/reset',
                data: exports.AuthTestExamples.passwordResetExecute,
                expectedStatus: 200,
                expectedResponse: '{ message: string }'
            }
        ]
    },
    // Rate Limiting Tests
    rateLimitingTests: {
        name: 'Rate Limiting Test Scenarios',
        scenarios: [
            {
                scenario: 'Login Rate Limiting',
                endpoint: 'POST /login',
                data: exports.AuthTestExamples.loginSuccess,
                attempts: 11,
                expectedStatus: 429,
                rateLimit: '10 attempts per minute'
            },
            {
                scenario: 'Password Reset Rate Limiting',
                endpoint: 'POST /password-reset/request',
                data: exports.AuthTestExamples.passwordResetRequest,
                attempts: 4,
                expectedStatus: 429,
                rateLimit: '3 attempts per 5 minutes'
            },
            {
                scenario: 'Registration Rate Limiting',
                endpoint: 'POST /register',
                data: exports.AuthTestExamples.registerSuccess,
                attempts: 6,
                expectedStatus: 429,
                rateLimit: '5 attempts per minute'
            }
        ]
    },
    // Error Handling Tests
    errorHandlingTests: {
        name: 'Error Handling Test Scenarios',
        scenarios: [
            {
                scenario: 'Invalid Email Format',
                endpoint: 'POST /register',
                data: exports.AuthTestExamples.validationError,
                expectedStatus: 400,
                expectedError: 'Validation Error'
            },
            {
                scenario: 'Duplicate Email Registration',
                endpoint: 'POST /register',
                data: exports.AuthTestExamples.conflictError,
                expectedStatus: 409,
                expectedError: 'Conflict Error'
            },
            {
                scenario: 'Invalid Login Credentials',
                endpoint: 'POST /login',
                data: exports.AuthTestExamples.unauthorizedError,
                expectedStatus: 401,
                expectedError: 'Unauthorized Error'
            },
            {
                scenario: 'Invalid Password Reset Token',
                endpoint: 'POST /password-reset/reset',
                data: {
                    token: 'invalid-token',
                    newPassword: 'NewPassword123!'
                },
                expectedStatus: 400,
                expectedError: 'Invalid or expired reset token'
            }
        ]
    }
};


/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserResponseDto = void 0;
const tslib_1 = __webpack_require__(5);
const swagger_1 = __webpack_require__(9);
const user_entity_1 = __webpack_require__(60);
const swagger_examples_1 = __webpack_require__(67);
class UserResponseDto {
}
exports.UserResponseDto = UserResponseDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the user',
        example: swagger_examples_1.ResponseExamples.userResponse.id,
        format: 'uuid',
    }),
    tslib_1.__metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the user',
        example: swagger_examples_1.ResponseExamples.userResponse.email,
        format: 'email',
    }),
    tslib_1.__metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'First name of the user',
        example: swagger_examples_1.ResponseExamples.userResponse.firstName,
        minLength: 1,
        maxLength: 50,
    }),
    tslib_1.__metadata("design:type", String)
], UserResponseDto.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last name of the user',
        example: swagger_examples_1.ResponseExamples.userResponse.lastName,
        minLength: 1,
        maxLength: 50,
    }),
    tslib_1.__metadata("design:type", String)
], UserResponseDto.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role of the user in the system',
        enum: user_entity_1.UserRole,
        example: swagger_examples_1.ResponseExamples.userResponse.role,
        enumName: 'UserRole',
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.UserRole !== "undefined" && user_entity_1.UserRole) === "function" ? _a : Object)
], UserResponseDto.prototype, "role", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the user account is active',
        example: swagger_examples_1.ResponseExamples.userResponse.isActive,
    }),
    tslib_1.__metadata("design:type", Boolean)
], UserResponseDto.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date and time when the user was created',
        example: swagger_examples_1.ResponseExamples.userResponse.createdAt,
        format: 'date-time',
    }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], UserResponseDto.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date and time when the user was last updated',
        example: swagger_examples_1.ResponseExamples.userResponse.updatedAt,
        format: 'date-time',
    }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], UserResponseDto.prototype, "updatedAt", void 0);


/***/ }),
/* 69 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginDto = void 0;
const tslib_1 = __webpack_require__(5);
const class_validator_1 = __webpack_require__(41);
const swagger_1 = __webpack_require__(9);
const swagger_examples_1 = __webpack_require__(67);
class LoginDto {
}
exports.LoginDto = LoginDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the user. Must be a registered email in the system.',
        example: swagger_examples_1.AuthTestExamples.loginSuccess.email,
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    tslib_1.__metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password for the user account. Must match the registered password.',
        example: swagger_examples_1.AuthTestExamples.loginSuccess.password,
        minLength: 6,
    }),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(6, { message: 'Password must be at least 6 characters long' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    tslib_1.__metadata("design:type", String)
], LoginDto.prototype, "password", void 0);


/***/ }),
/* 70 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthResponseDto = void 0;
const tslib_1 = __webpack_require__(5);
const swagger_1 = __webpack_require__(9);
const user_response_dto_1 = __webpack_require__(68);
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
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Vendor ID if user is a vendor' }),
    tslib_1.__metadata("design:type", String)
], AuthResponseDto.prototype, "vendorId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Confirmateur ID if user is a confirmateur' }),
    tslib_1.__metadata("design:type", String)
], AuthResponseDto.prototype, "confirmateurId", void 0);


/***/ }),
/* 71 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenDto = void 0;
const tslib_1 = __webpack_require__(5);
const class_validator_1 = __webpack_require__(41);
const swagger_1 = __webpack_require__(9);
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
/* 72 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestPasswordResetDto = void 0;
const tslib_1 = __webpack_require__(5);
const class_validator_1 = __webpack_require__(41);
const swagger_1 = __webpack_require__(9);
const swagger_examples_1 = __webpack_require__(67);
class RequestPasswordResetDto {
}
exports.RequestPasswordResetDto = RequestPasswordResetDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the user requesting password reset. Must be a registered email in the system.',
        example: swagger_examples_1.AuthTestExamples.passwordResetRequest.email,
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    tslib_1.__metadata("design:type", String)
], RequestPasswordResetDto.prototype, "email", void 0);


/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResetPasswordDto = void 0;
const tslib_1 = __webpack_require__(5);
const class_validator_1 = __webpack_require__(41);
const swagger_1 = __webpack_require__(9);
const swagger_examples_1 = __webpack_require__(67);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password reset token received via email. Must be a valid, non-expired token.',
        example: swagger_examples_1.AuthTestExamples.passwordResetExecute.token,
        minLength: 32,
        maxLength: 64,
        pattern: '^[a-f0-9]{32,64}$',
    }),
    (0, class_validator_1.IsString)({ message: 'Token must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token is required' }),
    tslib_1.__metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New password for the user. Must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
        example: swagger_examples_1.AuthTestExamples.passwordResetExecute.newPassword,
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
    }),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
    tslib_1.__metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);


/***/ }),
/* 74 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PasswordResetResponseDto = void 0;
const tslib_1 = __webpack_require__(5);
const swagger_1 = __webpack_require__(9);
class PasswordResetResponseDto {
}
exports.PasswordResetResponseDto = PasswordResetResponseDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'Password reset email sent successfully',
    }),
    tslib_1.__metadata("design:type", String)
], PasswordResetResponseDto.prototype, "message", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address where the reset link was sent',
        example: 'user@example.com',
    }),
    tslib_1.__metadata("design:type", String)
], PasswordResetResponseDto.prototype, "email", void 0);


/***/ }),
/* 75 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfirmPasswordResetDto = void 0;
const tslib_1 = __webpack_require__(5);
const class_validator_1 = __webpack_require__(41);
const swagger_1 = __webpack_require__(9);
class ConfirmPasswordResetDto {
}
exports.ConfirmPasswordResetDto = ConfirmPasswordResetDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password reset token to verify',
        example: 'abc123def456ghi789',
    }),
    (0, class_validator_1.IsString)({ message: 'Token must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token is required' }),
    tslib_1.__metadata("design:type", String)
], ConfirmPasswordResetDto.prototype, "token", void 0);


/***/ }),
/* 76 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PasswordResetConfirmationResponseDto = void 0;
const tslib_1 = __webpack_require__(5);
const swagger_1 = __webpack_require__(9);
class PasswordResetConfirmationResponseDto {
}
exports.PasswordResetConfirmationResponseDto = PasswordResetConfirmationResponseDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the token is valid',
        example: true,
    }),
    tslib_1.__metadata("design:type", Boolean)
], PasswordResetConfirmationResponseDto.prototype, "isValid", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User email associated with the token (only if valid)',
        example: 'user@example.com',
        required: false,
    }),
    tslib_1.__metadata("design:type", String)
], PasswordResetConfirmationResponseDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token expiration timestamp (only if valid)',
        example: '2024-01-15T14:30:00.000Z',
        required: false,
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], PasswordResetConfirmationResponseDto.prototype, "expiresAt", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message describing the token status',
        example: 'Token is valid and ready for password reset',
    }),
    tslib_1.__metadata("design:type", String)
], PasswordResetConfirmationResponseDto.prototype, "message", void 0);


/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 78 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const roles_decorator_1 = __webpack_require__(77);
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
/* 79 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getRateLimitingConfig = exports.rateLimitingConfig = void 0;
exports.rateLimitingConfig = [
    {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
    },
    {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
    },
    {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
    },
    // Sensitive endpoints - stricter limits
    {
        name: 'auth-strict',
        ttl: 300000, // 5 minutes
        limit: 5, // 5 requests per 5 minutes
    },
    {
        name: 'password-reset',
        ttl: 300000, // 5 minutes
        limit: 3, // 3 password reset requests per 5 minutes
    },
    {
        name: 'login-attempts',
        ttl: 900000, // 15 minutes
        limit: 10, // 10 login attempts per 15 minutes
    },
];
// Rate limiting configuration for different environments
const getRateLimitingConfig = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
        // More lenient limits for development
        return [
            {
                name: 'short',
                ttl: 1000,
                limit: 10, // More lenient for development
            },
            {
                name: 'medium',
                ttl: 10000,
                limit: 50,
            },
            {
                name: 'long',
                ttl: 60000,
                limit: 200,
            },
            {
                name: 'auth-strict',
                ttl: 300000,
                limit: 10,
            },
            {
                name: 'password-reset',
                ttl: 300000,
                limit: 5,
            },
            {
                name: 'login-attempts',
                ttl: 900000,
                limit: 20,
            },
        ];
    }
    return exports.rateLimitingConfig;
};
exports.getRateLimitingConfig = getRateLimitingConfig;


/***/ }),
/* 80 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SeedService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(14);
const user_entity_1 = __webpack_require__(60);
const bcrypt = tslib_1.__importStar(__webpack_require__(48));
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


/***/ }),
/* 81 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VendorsController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(9);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(14);
const vendeur_entity_1 = __webpack_require__(62);
const jwt_auth_guard_1 = __webpack_require__(82);
const roles_guard_1 = __webpack_require__(78);
let VendorsController = class VendorsController {
    constructor(vendeurRepo) {
        this.vendeurRepo = vendeurRepo;
    }
    async getConfirmQuota(query) {
        if (!query?.vendorId && !query?.vendorUserId) {
            throw new common_1.BadRequestException('vendorId or vendorUserId is required');
        }
        let vendeur = null;
        if (query.vendorId) {
            vendeur = await this.vendeurRepo.findOne({ where: { id: query.vendorId } });
        }
        if (!vendeur && query.vendorUserId) {
            vendeur = await this.vendeurRepo.findOne({ where: { idUser: query.vendorUserId } });
        }
        if (!vendeur)
            throw new common_1.NotFoundException('Vendor not found');
        return { vendorId: vendeur.id, remaining: vendeur.nbrCmdConf };
    }
    async consumeConfirmQuota(body) {
        if (!body?.vendorId && !body?.vendorUserId) {
            throw new common_1.BadRequestException('vendorId or vendorUserId is required');
        }
        let vendeur = null;
        if (body.vendorId) {
            vendeur = await this.vendeurRepo.findOne({ where: { id: body.vendorId } });
        }
        if (!vendeur && body.vendorUserId) {
            vendeur = await this.vendeurRepo.findOne({ where: { idUser: body.vendorUserId } });
        }
        if (!vendeur)
            throw new common_1.NotFoundException('Vendor not found');
        if ((vendeur.nbrCmdConf ?? 0) <= 0) {
            throw new common_1.ForbiddenException('Vendor has no remaining confirmations');
        }
        await this.vendeurRepo.update({ id: vendeur.id }, { nbrCmdConf: vendeur.nbrCmdConf - 1 });
        return { vendorId: vendeur.id, remaining: vendeur.nbrCmdConf - 1 };
    }
};
exports.VendorsController = VendorsController;
tslib_1.__decorate([
    (0, common_1.Get)('confirm-quota'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get vendor confirmation quota',
        description: 'Retrieve remaining confirmation quota for a vendor. Either vendorId or vendorUserId must be provided.'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'vendorId',
        required: false,
        description: 'Vendor ID',
        schema: { type: 'string', format: 'uuid' }
    }),
    (0, swagger_1.ApiQuery)({
        name: 'vendorUserId',
        required: false,
        description: 'Vendor User ID',
        schema: { type: 'string', format: 'uuid' }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Vendor quota retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                vendorId: { type: 'string', format: 'uuid' },
                remaining: { type: 'number', minimum: 0 }
            },
            example: {
                vendorId: '123e4567-e89b-12d3-a456-426614174000',
                remaining: 5
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad request - vendorId or vendorUserId required',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'vendorId or vendorUserId is required' },
                error: { type: 'string', example: 'Bad Request' },
                statusCode: { type: 'number', example: 400 }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Vendor not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Vendor not found' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorsController.prototype, "getConfirmQuota", null);
tslib_1.__decorate([
    (0, common_1.Post)('confirm-quota/consume'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consume vendor confirmation quota',
        description: 'Decrease vendor confirmation quota by 1. Either vendorId or vendorUserId must be provided.'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                vendorId: { type: 'string', format: 'uuid' },
                vendorUserId: { type: 'string', format: 'uuid' }
            },
            required: [],
            description: 'Either vendorId or vendorUserId is required',
            example: {
                vendorId: '123e4567-e89b-12d3-a456-426614174000'
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Quota consumed successfully',
        schema: {
            type: 'object',
            properties: {
                vendorId: { type: 'string', format: 'uuid' },
                remaining: { type: 'number', minimum: 0 }
            },
            example: {
                vendorId: '123e4567-e89b-12d3-a456-426614174000',
                remaining: 4
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Bad request - vendorId or vendorUserId required',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'vendorId or vendorUserId is required' },
                error: { type: 'string', example: 'Bad Request' },
                statusCode: { type: 'number', example: 400 }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Vendor not found',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Vendor not found' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'No remaining confirmations',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Vendor has no remaining confirmations' },
                error: { type: 'string', example: 'Forbidden' },
                statusCode: { type: 'number', example: 403 }
            }
        }
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VendorsController.prototype, "consumeConfirmQuota", null);
exports.VendorsController = VendorsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('internal'),
    (0, common_1.Controller)('internal/vendors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(vendeur_entity_1.Vendeur)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], VendorsController);


/***/ }),
/* 82 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(27);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 83 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupSwagger = setupSwagger;
const swagger_1 = __webpack_require__(9);
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('YouFizz Authentication API')
        .setDescription(`
      Comprehensive Authentication API for YouFizz platform.
      
      ## Features
      - User registration and authentication
      - JWT-based access tokens and refresh tokens
      - Password reset functionality with email notifications
      - Role-based access control (RBAC)
      - Rate limiting for security
      - Comprehensive error handling
      
      ## Authentication
      Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:
      \`\`\`
      Authorization: Bearer <access_token>
      \`\`\`
      
      ## Rate Limiting
      The API implements rate limiting to prevent abuse:
      - Registration: 5 requests per minute
      - Login: 10 requests per minute
      - Password Reset: 3 requests per 5 minutes
      
      Rate limit information is provided in response headers:
      - \`X-RateLimit-Limit\`: Maximum requests allowed
      - \`X-RateLimit-Remaining\`: Requests remaining in current window
      - \`X-RateLimit-Reset\`: Timestamp when the limit resets
      - \`Retry-After\`: Seconds to wait before retrying
      
      ## Test Scenarios
      This API includes comprehensive test examples for:
      - Complete user registration and authentication flow
      - Password reset process
      - Rate limiting behavior
      - Error handling and validation
      
      ## Postman Collection
      Import the provided Postman collection for automated testing:
      - Complete test scenarios
      - Automated assertions
      - Environment variables
      - Rate limiting tests
    `)
        .setVersion('1.0.0')
        .setContact('YouFizz Team', 'https://youfizz.com', 'support@youfizz.com')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addServer('http://localhost:3001', 'Development Server')
        .addServer('https://api.youfizz.com', 'Production Server')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Authentication', 'User authentication and authorization endpoints')
        .addTag('Password Reset', 'Password reset and recovery endpoints')
        .addTag('User Management', 'User management and administration endpoints')
        .addTag('Rate Limiting', 'Rate limiting and security information')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey, methodKey) => methodKey,
    });
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
            showRequestHeaders: true,
            showCommonExtensions: true,
            tryItOutEnabled: true,
            requestInterceptor: (req) => {
                // Add custom headers or modify requests
                return req;
            },
            responseInterceptor: (res) => {
                // Add custom response handling
                return res;
            },
        },
        customSiteTitle: 'YouFizz Auth API Documentation',
        customfavIcon: '/favicon.ico',
        customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 5px; }
    `,
    });
    return document;
}


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
const app_module_1 = __webpack_require__(4);
const swagger_config_1 = __webpack_require__(83);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: { port: 4001 },
    });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    // Setup comprehensive Swagger documentation
    (0, swagger_config_1.setupSwagger)(app);
    await app.startAllMicroservices();
    const port = 3001;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    common_1.Logger.log(`🚀 Microservice is listening on TCP port: ${port}`);
    common_1.Logger.log(`📖 Swagger docs available on: http://localhost:${port}/api`);
}
bootstrap();

})();

/******/ })()
;