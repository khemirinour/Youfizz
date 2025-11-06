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

module.exports = require("@nestjs/swagger");

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
const app_service_1 = __webpack_require__(9);
const gateway_service_1 = __webpack_require__(10);
const shared_1 = __webpack_require__(13);
const passport_1 = __webpack_require__(26);
const jwt_1 = __webpack_require__(25);
const shared_2 = __webpack_require__(13);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            shared_1.SharedModule,
            axios_1.HttpModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') },
            }),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [{
                        ttl: 60,
                        limit: 100,
                    }],
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, gateway_service_1.GatewayService, shared_2.JwtStrategy],
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


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(3);
const throttler_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(9);
const gateway_service_1 = __webpack_require__(10);
const shared_1 = __webpack_require__(13);
const express_1 = __webpack_require__(57);
let AppController = class AppController {
    constructor(appService, gatewayService) {
        this.appService = appService;
        this.gatewayService = gatewayService;
    }
    getData() {
        return this.appService.getData();
    }
    async healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'api-gateway',
        };
    }
    // ==================== Auth Service Routes ====================
    async register(body, headers) {
        return this.gatewayService.forwardRequest('/register', 'POST', body, headers);
    }
    async login(body, headers) {
        return this.gatewayService.forwardRequest('/login', 'POST', body, headers);
    }
    async refresh(body, headers) {
        return this.gatewayService.forwardRequest('/refresh', 'POST', body, headers);
    }
    async logout(body, headers, req) {
        return this.gatewayService.forwardRequest('/logout', 'POST', body, headers, req.user);
    }
    async logoutAll(body, headers, req) {
        return this.gatewayService.forwardRequest('/logout-all', 'POST', body, headers, req.user);
    }
    async getUsers(query, headers, req) {
        const qs = new URLSearchParams(query).toString();
        const path = qs ? `/users?${qs}` : '/users';
        return this.gatewayService.forwardRequest(path, 'GET', null, headers, req.user);
    }
    async getUser(id, headers, req) {
        return this.gatewayService.forwardRequest(`/users/${id}`, 'GET', null, headers, req.user);
    }
    async getRoles(headers, req) {
        return this.gatewayService.forwardRequest('/roles', 'GET', null, headers, req.user);
    }
    async updateUserRole(id, role, headers, req) {
        return this.gatewayService.forwardRequest(`/users/${id}/role/${role}`, 'PATCH', null, headers, req.user);
    }
    async updateUserActive(id, body, headers, req) {
        return this.gatewayService.forwardRequest(`/users/${id}/active`, 'PATCH', body, headers, req.user);
    }
    async incrementVendeurNbrCmdConf(id, body, headers, req) {
        return this.gatewayService.forwardRequest(`/users/${id}/vendeur/nbr-cmd-conf`, 'PATCH', body, headers, req.user);
    }
    async deleteUser(id, headers, req) {
        return this.gatewayService.forwardRequest(`/users/${id}`, 'DELETE', null, headers, req.user);
    }
    async getVendeurConfermateurs(vendeurId, headers, req) {
        return this.gatewayService.forwardRequest(`/vendeurs/${vendeurId}/confermateurs`, 'GET', null, headers, req.user);
    }
    async getConfermateurs(headers, req) {
        return this.gatewayService.forwardRequest('/confermateurs', 'GET', null, headers, req.user);
    }
    async assignVendeurToConfermateur(confermateurId, vendeurId, headers, req) {
        return this.gatewayService.forwardRequest(`/confermateurs/${confermateurId}/vendeurs/${vendeurId}`, 'POST', null, headers, req.user);
    }
    async unassignVendeurFromConfermateur(confermateurId, vendeurId, headers, req) {
        return this.gatewayService.forwardRequest(`/confermateurs/${confermateurId}/vendeurs/${vendeurId}`, 'DELETE', null, headers, req.user);
    }
    async requestPasswordReset(body, headers) {
        return this.gatewayService.forwardRequest('/password-reset/request', 'POST', body, headers);
    }
    async confirmPasswordResetToken(body, headers) {
        return this.gatewayService.forwardRequest('/password-reset/confirm', 'POST', body, headers);
    }
    async resetPassword(body, headers) {
        return this.gatewayService.forwardRequest('/password-reset/reset', 'POST', body, headers);
    }
    // ==================== Article Service Routes ====================
    async getArticles(query, headers) {
        return this.gatewayService.forwardRequest('/articles', 'GET', null, headers);
    }
    async createArticle(body, headers, req) {
        return this.gatewayService.forwardRequest('/articles', 'POST', body, headers, req.user);
    }
    async getArticle(id, headers) {
        return this.gatewayService.forwardRequest(`/articles/${id}`, 'GET', null, headers);
    }
    async getArticlesByVendor(vendorId, headers) {
        return this.gatewayService.forwardRequest(`/articles/vendor/${vendorId}`, 'GET', null, headers);
    }
    async updateArticle(id, body, headers, req) {
        return this.gatewayService.forwardRequest(`/articles/${id}`, 'PUT', body, headers, req.user);
    }
    async deleteArticle(id, headers, req) {
        return this.gatewayService.forwardRequest(`/articles/${id}`, 'DELETE', null, headers, req.user);
    }
    async activateArticle(id, headers, req) {
        return this.gatewayService.forwardRequest(`/articles/${id}/activate`, 'PATCH', null, headers, req.user);
    }
    async deactivateArticle(id, headers, req) {
        return this.gatewayService.forwardRequest(`/articles/${id}/deactivate`, 'PATCH', null, headers, req.user);
    }
    // ==================== Order Service Routes ====================
    async getOrders(query, headers, req) {
        return this.gatewayService.forwardRequest('/orders', 'GET', null, headers, req.user);
    }
    async createOrder(body, headers, req) {
        return this.gatewayService.forwardRequest('/orders', 'POST', body, headers, req.user);
    }
    async getOrder(id, headers, req) {
        return this.gatewayService.forwardRequest(`/orders/${id}`, 'GET', null, headers, req.user);
    }
    async updateOrder(id, body, headers, req) {
        return this.gatewayService.forwardRequest(`/orders/${id}`, 'PUT', body, headers, req.user);
    }
    async deleteOrder(id, headers, req) {
        return this.gatewayService.forwardRequest(`/orders/${id}`, 'DELETE', null, headers, req.user);
    }
    async confirmOrder(id, headers, req) {
        return this.gatewayService.forwardRequest(`/orders/${id}/confirm`, 'PATCH', null, headers, req.user);
    }
    async activateOrder(id, headers, req) {
        return this.gatewayService.forwardRequest(`/orders/${id}/activate`, 'PATCH', null, headers, req.user);
    }
    async deactivateOrder(id, headers, req) {
        return this.gatewayService.forwardRequest(`/orders/${id}/deactivate`, 'PATCH', null, headers, req.user);
    }
    // ==================== User Profile Routes ====================
    async getProfile(headers, req) {
        return this.gatewayService.forwardRequest('/profile', 'GET', null, headers, req.user);
    }
    async updateProfile(body, headers, req) {
        return this.gatewayService.forwardRequest('/profile', 'PUT', body, headers, req.user);
    }
    // ==================== Notification Routes ====================
    async getNotifications(query, headers, req) {
        return this.gatewayService.forwardRequest('/notifications', 'GET', null, headers, req.user);
    }
    async markNotificationRead(id, headers, req) {
        return this.gatewayService.forwardRequest(`/notifications/${id}/read`, 'PATCH', null, headers, req.user);
    }
    // ==================== Statistics Routes ====================
    async getUserStats(headers, req) {
        return this.gatewayService.forwardRequest('/stats/users', 'GET', null, headers, req.user);
    }
    async getOrderStats(headers, req) {
        return this.gatewayService.forwardRequest('/stats/orders', 'GET', null, headers, req.user);
    }
    async getArticleStats(headers, req) {
        return this.gatewayService.forwardRequest('/stats/articles', 'GET', null, headers, req.user);
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
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check', description: 'Check API Gateway service health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service health status' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "healthCheck", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Post)('auth/register'),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Register a new user',
        description: 'Creates a new user account. Rate limited to 5 requests per minute.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully registered' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation errors' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    (0, swagger_1.ApiBody)({ description: 'User registration data', schema: { type: 'object' } }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "register", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Post)('auth/login'),
    (0, throttler_1.Throttle)({ short: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'User login',
        description: 'Authenticate user and receive access/refresh tokens. Rate limited to 10 requests per minute.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiBody)({ description: 'Login credentials', schema: { type: 'object' } }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_d = typeof Record !== "undefined" && Record) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Post)('auth/refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token', description: 'Get a new access token using a valid refresh token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    (0, swagger_1.ApiBody)({ description: 'Refresh token data', schema: { type: 'object' } }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_e = typeof Record !== "undefined" && Record) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "refresh", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Post)('auth/logout'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user', description: 'Invalidate current session and refresh token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_f = typeof Record !== "undefined" && Record) === "function" ? _f : Object, typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "logout", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Post)('auth/logout-all'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout from all devices', description: 'Invalidate all refresh tokens for the user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logged out from all devices' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_h = typeof Record !== "undefined" && Record) === "function" ? _h : Object, typeof (_j = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "logoutAll", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Get)('auth/users'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all users (Admin only)',
        description: 'Get paginated list of all users. Returns additional data based on role (nbrCmdConf for VENDEUR, associated vendeurs for CONFERMATEUR).'
    }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, description: 'Filter by user role' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_k = typeof Record !== "undefined" && Record) === "function" ? _k : Object, typeof (_l = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _l : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getUsers", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Get)('auth/users/:id'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID (Admin only)', description: 'Retrieve detailed information about a specific user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_m = typeof Record !== "undefined" && Record) === "function" ? _m : Object, typeof (_o = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _o : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getUser", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Get)('auth/roles'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available roles', description: 'Retrieve list of all available user roles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Roles retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    tslib_1.__param(0, (0, common_1.Headers)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_p = typeof Record !== "undefined" && Record) === "function" ? _p : Object, typeof (_q = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _q : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getRoles", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Patch)('auth/users/:id/role/:role'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user role (Admin only)', description: 'Change the role of a user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiParam)({ name: 'role', description: 'New role (admin, vendeur, confermateur, guest)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User role updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Param)('role')),
    tslib_1.__param(2, (0, common_1.Headers)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, typeof (_r = typeof Record !== "undefined" && Record) === "function" ? _r : Object, typeof (_s = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _s : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "updateUserRole", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Patch)('auth/users/:id/active'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user active status (Admin only)', description: 'Activate or deactivate a user account' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiBody)({ description: 'Active status', schema: { type: 'object', properties: { isActive: { type: 'boolean' } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Headers)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, typeof (_t = typeof Record !== "undefined" && Record) === "function" ? _t : Object, typeof (_u = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _u : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "updateUserActive", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Patch)('auth/users/:id/vendeur/nbr-cmd-conf'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Increment vendeur nbrCmdConf (Admin only)',
        description: 'Increment the number of confirmed commands for a vendeur by a specified amount'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID (must be a vendeur)' }),
    (0, swagger_1.ApiBody)({
        description: 'Increment amount',
        schema: { type: 'object', properties: { amount: { type: 'number', default: 1 } } }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'nbrCmdConf incremented successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Headers)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, typeof (_v = typeof Record !== "undefined" && Record) === "function" ? _v : Object, typeof (_w = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _w : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "incrementVendeurNbrCmdConf", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Delete)('auth/users/:id'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (Admin only)', description: 'Permanently delete a user account' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_x = typeof Record !== "undefined" && Record) === "function" ? _x : Object, typeof (_y = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _y : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Get)('auth/vendeurs/:vendeurId/confermateurs'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get confermateurs for a vendeur', description: 'Retrieve list of confermateurs associated with a vendeur' }),
    (0, swagger_1.ApiParam)({ name: 'vendeurId', description: 'Vendeur ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Confermateurs retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    tslib_1.__param(0, (0, common_1.Param)('vendeurId')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_z = typeof Record !== "undefined" && Record) === "function" ? _z : Object, typeof (_0 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _0 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getVendeurConfermateurs", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Get)('auth/confermateurs'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List all confermateurs', description: 'Get list of all confermateurs in the system' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Confermateurs retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    tslib_1.__param(0, (0, common_1.Headers)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_1 = typeof Record !== "undefined" && Record) === "function" ? _1 : Object, typeof (_2 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _2 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getConfermateurs", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Post)('auth/confermateurs/:confermateurId/vendeurs/:vendeurId'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign vendeur to confermateur (Admin only)', description: 'Create an assignment relationship between a confermateur and a vendeur' }),
    (0, swagger_1.ApiParam)({ name: 'confermateurId', description: 'Confermateur ID' }),
    (0, swagger_1.ApiParam)({ name: 'vendeurId', description: 'Vendeur ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendeur assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Param)('confermateurId')),
    tslib_1.__param(1, (0, common_1.Param)('vendeurId')),
    tslib_1.__param(2, (0, common_1.Headers)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, typeof (_3 = typeof Record !== "undefined" && Record) === "function" ? _3 : Object, typeof (_4 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _4 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "assignVendeurToConfermateur", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Delete)('auth/confermateurs/:confermateurId/vendeurs/:vendeurId'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Unassign vendeur from confermateur (Admin only)', description: 'Remove assignment relationship between a confermateur and a vendeur' }),
    (0, swagger_1.ApiParam)({ name: 'confermateurId', description: 'Confermateur ID' }),
    (0, swagger_1.ApiParam)({ name: 'vendeurId', description: 'Vendeur ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendeur unassigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Param)('confermateurId')),
    tslib_1.__param(1, (0, common_1.Param)('vendeurId')),
    tslib_1.__param(2, (0, common_1.Headers)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, typeof (_5 = typeof Record !== "undefined" && Record) === "function" ? _5 : Object, typeof (_6 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _6 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "unassignVendeurFromConfermateur", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Post)('auth/password-reset/request'),
    (0, throttler_1.Throttle)({ short: { limit: 3, ttl: 300000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Request password reset',
        description: 'Send password reset email to user. Rate limited to 3 requests per 5 minutes.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset email sent (if account exists)' }),
    (0, swagger_1.ApiBody)({ description: 'Email address', schema: { type: 'object', properties: { email: { type: 'string' } } } }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_7 = typeof Record !== "undefined" && Record) === "function" ? _7 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "requestPasswordReset", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Post)('auth/password-reset/confirm'),
    (0, throttler_1.Throttle)({ short: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm password reset token',
        description: 'Verify if password reset token is valid. Rate limited to 10 requests per minute.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token validation result' }),
    (0, swagger_1.ApiBody)({ description: 'Reset token', schema: { type: 'object', properties: { token: { type: 'string' } } } }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_8 = typeof Record !== "undefined" && Record) === "function" ? _8 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "confirmPasswordResetToken", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Post)('auth/password-reset/reset'),
    (0, throttler_1.Throttle)({ short: { limit: 5, ttl: 300000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Reset password',
        description: 'Reset user password using valid reset token. Rate limited to 5 requests per 5 minutes.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully' }),
    (0, swagger_1.ApiBody)({ description: 'Reset token and new password', schema: { type: 'object' } }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_9 = typeof Record !== "undefined" && Record) === "function" ? _9 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "resetPassword", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Get)('articles'),
    (0, swagger_1.ApiOperation)({
        summary: 'List articles',
        description: 'Get paginated list of articles with optional filters (search, category, vendor, status, visibility)'
    }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by title' }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false, description: 'Filter by category ID' }),
    (0, swagger_1.ApiQuery)({ name: 'vendorId', required: false, description: 'Filter by vendor ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default: 0)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Articles retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_10 = typeof Record !== "undefined" && Record) === "function" ? _10 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getArticles", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Post)('articles'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create article', description: 'Create a new article. Requires ADMIN or VENDEUR role.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Article created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' }),
    (0, swagger_1.ApiBody)({ description: 'Article data', schema: { type: 'object' } }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_11 = typeof Record !== "undefined" && Record) === "function" ? _11 : Object, typeof (_12 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _12 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "createArticle", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Get)('articles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get article by ID', description: 'Retrieve detailed information about a specific article' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Article ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_13 = typeof Record !== "undefined" && Record) === "function" ? _13 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getArticle", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Get)('articles/vendor/:vendorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get articles by vendor ID', description: 'Retrieve all articles belonging to a specific vendor' }),
    (0, swagger_1.ApiParam)({ name: 'vendorId', description: 'Vendor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Articles retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('vendorId')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_14 = typeof Record !== "undefined" && Record) === "function" ? _14 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getArticlesByVendor", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Put)('articles/:id'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update article', description: 'Update an existing article. Requires ADMIN or VENDEUR role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Article ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    (0, swagger_1.ApiBody)({ description: 'Updated article data', schema: { type: 'object' } }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Headers)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, typeof (_15 = typeof Record !== "undefined" && Record) === "function" ? _15 : Object, typeof (_16 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _16 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "updateArticle", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Delete)('articles/:id'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete article (Admin only)', description: 'Permanently delete an article' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Article ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_17 = typeof Record !== "undefined" && Record) === "function" ? _17 : Object, typeof (_18 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _18 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "deleteArticle", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Patch)('articles/:id/activate'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate article', description: 'Make an article visible/active. Requires ADMIN or VENDEUR role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Article ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article activated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_19 = typeof Record !== "undefined" && Record) === "function" ? _19 : Object, typeof (_20 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _20 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "activateArticle", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Patch)('articles/:id/deactivate'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate article', description: 'Hide/deactivate an article. Requires ADMIN or VENDEUR role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Article ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_21 = typeof Record !== "undefined" && Record) === "function" ? _21 : Object, typeof (_22 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _22 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "deactivateArticle", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Get)('orders'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'List orders',
        description: 'Get paginated list of orders. Accessible by ADMIN, VENDEUR, or CONFERMATEUR roles.'
    }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by order number' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: 'vendorId', required: false, description: 'Filter by vendor ID' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default: 0)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Orders retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_23 = typeof Record !== "undefined" && Record) === "function" ? _23 : Object, typeof (_24 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _24 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getOrders", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Post)('orders'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create order', description: 'Create a new order. Requires ADMIN or VENDEUR role.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires ADMIN or VENDEUR role' }),
    (0, swagger_1.ApiBody)({ description: 'Order data', schema: { type: 'object' } }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_25 = typeof Record !== "undefined" && Record) === "function" ? _25 : Object, typeof (_26 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _26 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "createOrder", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Get)('orders/:id'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by ID', description: 'Retrieve detailed information about a specific order' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_27 = typeof Record !== "undefined" && Record) === "function" ? _27 : Object, typeof (_28 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _28 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getOrder", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Put)('orders/:id'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order', description: 'Update an existing order. Requires ADMIN, VENDEUR, or CONFERMATEUR role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, swagger_1.ApiBody)({ description: 'Updated order data', schema: { type: 'object' } }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Headers)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, typeof (_29 = typeof Record !== "undefined" && Record) === "function" ? _29 : Object, typeof (_30 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _30 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "updateOrder", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Delete)('orders/:id'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete order (Admin only)', description: 'Permanently delete an order' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_31 = typeof Record !== "undefined" && Record) === "function" ? _31 : Object, typeof (_32 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _32 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "deleteOrder", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Patch)('orders/:id/confirm'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm order',
        description: 'Confirm an order (consumes vendeur confirmation quota). Requires VENDEUR or CONFERMATEUR role.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order confirmed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires VENDEUR or CONFERMATEUR role, or no remaining confirmations' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_33 = typeof Record !== "undefined" && Record) === "function" ? _33 : Object, typeof (_34 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _34 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "confirmOrder", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Patch)('orders/:id/activate'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate order', description: 'Activate an order. Requires ADMIN, VENDEUR, or CONFERMATEUR role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order activated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_35 = typeof Record !== "undefined" && Record) === "function" ? _35 : Object, typeof (_36 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _36 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "activateOrder", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Patch)('orders/:id/deactivate'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate order', description: 'Deactivate an order. Requires ADMIN, VENDEUR, or CONFERMATEUR role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_37 = typeof Record !== "undefined" && Record) === "function" ? _37 : Object, typeof (_38 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _38 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "deactivateOrder", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('profile'),
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile', description: 'Retrieve authenticated user profile information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    tslib_1.__param(0, (0, common_1.Headers)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_39 = typeof Record !== "undefined" && Record) === "function" ? _39 : Object, typeof (_40 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _40 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('profile'),
    (0, common_1.Put)('profile'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile', description: 'Update authenticated user profile information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ description: 'Updated profile data', schema: { type: 'object' } }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_41 = typeof Record !== "undefined" && Record) === "function" ? _41 : Object, typeof (_42 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _42 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "updateProfile", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Get)('notifications'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notifications', description: 'Retrieve notifications for authenticated user' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_43 = typeof Record !== "undefined" && Record) === "function" ? _43 : Object, typeof (_44 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _44 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getNotifications", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Patch)('notifications/:id/read'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read', description: 'Mark a notification as read for authenticated user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Notification ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_45 = typeof Record !== "undefined" && Record) === "function" ? _45 : Object, typeof (_46 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _46 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "markNotificationRead", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('statistics'),
    (0, common_1.Get)('stats/users'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user statistics (Admin only)',
        description: 'Retrieve comprehensive user statistics including total count, breakdown by role, active/inactive counts, and vendeurs with confirmed commands'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Headers)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_47 = typeof Record !== "undefined" && Record) === "function" ? _47 : Object, typeof (_48 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _48 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getUserStats", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('statistics'),
    (0, common_1.Get)('stats/orders'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get order statistics (Admin only)',
        description: 'Retrieve comprehensive order statistics including total count, breakdown by status, paid/unpaid counts, active/inactive counts, and total revenue'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Headers)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_49 = typeof Record !== "undefined" && Record) === "function" ? _49 : Object, typeof (_50 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _50 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getOrderStats", null);
tslib_1.__decorate([
    (0, swagger_1.ApiTags)('statistics'),
    (0, common_1.Get)('stats/articles'),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get article statistics (Admin only)',
        description: 'Retrieve comprehensive article statistics including total count, breakdown by status, active/inactive counts, and total stock quantity'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    tslib_1.__param(0, (0, common_1.Headers)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_51 = typeof Record !== "undefined" && Record) === "function" ? _51 : Object, typeof (_52 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _52 : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getArticleStats", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('api-gateway'),
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object, typeof (_b = typeof gateway_service_1.GatewayService !== "undefined" && gateway_service_1.GatewayService) === "function" ? _b : Object])
], AppController);


/***/ }),
/* 9 */
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
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var GatewayService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GatewayService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const axios_1 = __webpack_require__(6);
const config_1 = __webpack_require__(11);
const rxjs_1 = __webpack_require__(12);
let GatewayService = GatewayService_1 = class GatewayService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(GatewayService_1.name);
        this.serviceEndpoints = [
            // Auth service endpoints
            { service: 'auth', path: '/register', method: 'POST', requiresAuth: false },
            { service: 'auth', path: '/login', method: 'POST', requiresAuth: false },
            { service: 'auth', path: '/refresh', method: 'POST', requiresAuth: false },
            { service: 'auth', path: '/logout', method: 'POST', requiresAuth: true },
            { service: 'auth', path: '/logout-all', method: 'POST', requiresAuth: true },
            { service: 'auth', path: '/users', method: 'GET', requiresAuth: true, roles: ['admin'] },
            { service: 'auth', path: '/users/:id', method: 'GET', requiresAuth: true, roles: ['admin'] },
            { service: 'auth', path: '/roles', method: 'GET', requiresAuth: true },
            { service: 'auth', path: '/users/:id/role/:role', method: 'PATCH', requiresAuth: true, roles: ['admin'] },
            { service: 'auth', path: '/users/:id/active', method: 'PATCH', requiresAuth: true, roles: ['admin'] },
            { service: 'auth', path: '/users/:id/vendeur/nbr-cmd-conf', method: 'PATCH', requiresAuth: true, roles: ['admin'] },
            { service: 'auth', path: '/users/:id', method: 'DELETE', requiresAuth: true, roles: ['admin'] },
            { service: 'auth', path: '/vendeurs/:vendeurId/confermateurs', method: 'GET', requiresAuth: true, roles: ['vendeur', 'admin'] },
            { service: 'auth', path: '/confermateurs', method: 'GET', requiresAuth: true },
            { service: 'auth', path: '/confermateurs/:confermateurId/vendeurs/:vendeurId', method: 'POST', requiresAuth: true, roles: ['admin'] },
            { service: 'auth', path: '/confermateurs/:confermateurId/vendeurs/:vendeurId', method: 'DELETE', requiresAuth: true, roles: ['admin'] },
            { service: 'auth', path: '/password-reset/request', method: 'POST', requiresAuth: false },
            { service: 'auth', path: '/password-reset/confirm', method: 'POST', requiresAuth: false },
            { service: 'auth', path: '/password-reset/reset', method: 'POST', requiresAuth: false },
            { service: 'auth', path: '/stats/users', method: 'GET', requiresAuth: true, roles: ['admin'] },
            // Article service endpoints
            { service: 'article', path: '/articles', method: 'GET', requiresAuth: false },
            { service: 'article', path: '/articles', method: 'POST', requiresAuth: true, roles: ['admin', 'vendeur'] },
            { service: 'article', path: '/articles/:id', method: 'GET', requiresAuth: false },
            { service: 'article', path: '/articles/vendor/:vendorId', method: 'GET', requiresAuth: false },
            { service: 'article', path: '/articles/:id', method: 'PUT', requiresAuth: true, roles: ['admin', 'vendeur'] },
            { service: 'article', path: '/articles/:id', method: 'DELETE', requiresAuth: true, roles: ['admin'] },
            { service: 'article', path: '/articles/:id/activate', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur'] },
            { service: 'article', path: '/articles/:id/deactivate', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur'] },
            { service: 'article', path: '/stats/articles', method: 'GET', requiresAuth: true, roles: ['admin'] },
            // CMD service endpoints
            { service: 'cmd', path: '/orders', method: 'GET', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
            { service: 'cmd', path: '/orders', method: 'POST', requiresAuth: true, roles: ['admin', 'vendeur'] },
            { service: 'cmd', path: '/orders/:id', method: 'GET', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
            { service: 'cmd', path: '/orders/:id', method: 'PUT', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
            { service: 'cmd', path: '/orders/:id', method: 'DELETE', requiresAuth: true, roles: ['admin'] },
            { service: 'cmd', path: '/orders/:id/confirm', method: 'PATCH', requiresAuth: true, roles: ['vendeur', 'confermateur'] },
            { service: 'cmd', path: '/orders/:id/activate', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
            { service: 'cmd', path: '/orders/:id/deactivate', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
            { service: 'cmd', path: '/stats/orders', method: 'GET', requiresAuth: true, roles: ['admin'] },
            // User service endpoints
            { service: 'user', path: '/profile', method: 'GET', requiresAuth: true },
            { service: 'user', path: '/profile', method: 'PUT', requiresAuth: true },
            // Notification service endpoints
            { service: 'notification', path: '/notifications', method: 'GET', requiresAuth: true },
            { service: 'notification', path: '/notifications/:id/read', method: 'PATCH', requiresAuth: true },
        ];
    }
    getServiceUrl(service) {
        const serviceConfigs = {
            auth: this.configService.get('authService'),
            user: this.configService.get('userService'),
            article: this.configService.get('articleService'),
            cmd: this.configService.get('cmdService'),
            notification: this.configService.get('notificationService'),
        };
        const config = serviceConfigs[service];
        if (!config) {
            throw new common_1.HttpException(`Service ${service} not configured`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return `http://localhost:${config.port}`;
    }
    findEndpoint(path, method) {
        return this.serviceEndpoints.find(endpoint => {
            const pathMatch = endpoint.path === path ||
                (endpoint.path.includes(':') && this.matchPathPattern(endpoint.path, path));
            return pathMatch && endpoint.method === method;
        });
    }
    matchPathPattern(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length)
            return false;
        return patternParts.every((part, index) => {
            return part.startsWith(':') || part === pathParts[index];
        });
    }
    sanitizeHeaders(headers = {}) {
        const blocked = new Set([
            'host',
            'content-length',
            'transfer-encoding',
            'connection',
            'accept-encoding',
            'content-encoding',
        ]);
        const result = {};
        for (const [key, value] of Object.entries(headers)) {
            const lowerKey = key.toLowerCase();
            if (!blocked.has(lowerKey) && value !== undefined && value !== null) {
                result[key] = value;
            }
        }
        if (!result['Content-Type'] && !result['content-type']) {
            result['Content-Type'] = 'application/json';
        }
        return result;
    }
    async forwardRequest(path, method, body, headers, user) {
        const [pathname, queryString] = path.split('?');
        const endpoint = this.findEndpoint(pathname, method);
        if (!endpoint) {
            throw new common_1.HttpException(`Endpoint not found: ${method} ${pathname}`, common_1.HttpStatus.NOT_FOUND);
        }
        // Check authentication requirements
        if (endpoint.requiresAuth && !user) {
            throw new common_1.HttpException('Authentication required', common_1.HttpStatus.UNAUTHORIZED);
        }
        // Check role requirements
        if (endpoint.roles && user && !endpoint.roles.includes(user.role)) {
            throw new common_1.HttpException('Insufficient permissions', common_1.HttpStatus.FORBIDDEN);
        }
        const serviceUrl = this.getServiceUrl(endpoint.service);
        // Add special handling for stats endpoints
        let forwardedPath = pathname;
        if (endpoint.service === 'cmd' && pathname === '/stats/orders') {
            forwardedPath = '/orders/stats/orders';
        }
        else if (endpoint.service === 'article' && pathname === '/stats/articles') {
            forwardedPath = '/articles/stats/articles';
        }
        const fullUrl = `${serviceUrl}/api${forwardedPath}`;
        const sanitized = this.sanitizeHeaders(headers);
        const config = {
            method: method.toLowerCase(),
            url: fullUrl,
            headers: {
                ...sanitized,
                ...(user ? { 'x-user-id': user.userId, 'x-user-role': user.role } : {}),
                'x-forwarded-for': headers['x-forwarded-for'] || 'gateway',
            },
            timeout: 30000,
            // validateStatus: (status) => {
            //   // Treat 2xx and 3xx (including 304 Not Modified) as success
            //   return status >= 200 && status < 400;
            // },
        };
        if (queryString) {
            const params = Object.fromEntries(new URLSearchParams(queryString));
            config.params = params;
        }
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            config.data = body;
        }
        try {
            this.logger.log(`Forwarding ${method} ${path} to ${endpoint.service} service`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request(config));
            return response.data; // Return only the data, not the full Axios response
        }
        catch (error) {
            this.logger.error(`Error forwarding ${method} ${path} to ${endpoint.service} service:`, error?.message || 'Unknown error');
            if (error?.response) {
                this.logger.error(`Response status: ${error.response.status}, URL: ${fullUrl}`);
                throw new common_1.HttpException(error.response.data || 'Service error', error.response.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw new common_1.HttpException('Service unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    getServiceEndpoints() {
        return this.serviceEndpoints;
    }
};
exports.GatewayService = GatewayService;
exports.GatewayService = GatewayService = GatewayService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], GatewayService);


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(5);
tslib_1.__exportStar(__webpack_require__(14), exports);
tslib_1.__exportStar(__webpack_require__(15), exports);
tslib_1.__exportStar(__webpack_require__(17), exports);
tslib_1.__exportStar(__webpack_require__(37), exports);
tslib_1.__exportStar(__webpack_require__(19), exports);
tslib_1.__exportStar(__webpack_require__(20), exports);
tslib_1.__exportStar(__webpack_require__(36), exports);
tslib_1.__exportStar(__webpack_require__(38), exports);
tslib_1.__exportStar(__webpack_require__(40), exports);
tslib_1.__exportStar(__webpack_require__(34), exports);
tslib_1.__exportStar(__webpack_require__(22), exports);
tslib_1.__exportStar(__webpack_require__(31), exports);
tslib_1.__exportStar(__webpack_require__(32), exports);
tslib_1.__exportStar(__webpack_require__(35), exports);
tslib_1.__exportStar(__webpack_require__(41), exports);
tslib_1.__exportStar(__webpack_require__(43), exports);
tslib_1.__exportStar(__webpack_require__(24), exports);
tslib_1.__exportStar(__webpack_require__(29), exports);
tslib_1.__exportStar(__webpack_require__(27), exports);
tslib_1.__exportStar(__webpack_require__(30), exports);
tslib_1.__exportStar(__webpack_require__(44), exports);
tslib_1.__exportStar(__webpack_require__(47), exports);
tslib_1.__exportStar(__webpack_require__(48), exports);
tslib_1.__exportStar(__webpack_require__(50), exports);
tslib_1.__exportStar(__webpack_require__(51), exports);
tslib_1.__exportStar(__webpack_require__(55), exports);
tslib_1.__exportStar(__webpack_require__(56), exports);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const database_module_1 = __webpack_require__(15);
const database_service_1 = __webpack_require__(17);
const email_module_1 = __webpack_require__(19);
const config_module_1 = __webpack_require__(22);
const auth_module_1 = __webpack_require__(24);
const rate_limit_guard_1 = __webpack_require__(31);
const logging_interceptor_1 = __webpack_require__(32);
const response_interceptor_1 = __webpack_require__(35);
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
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(16);
const config_1 = __webpack_require__(11);
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

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(16);
const typeorm_2 = __webpack_require__(18);
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
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const email_service_1 = __webpack_require__(20);
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
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var EmailService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const nodemailer = tslib_1.__importStar(__webpack_require__(21));
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
/* 21 */
/***/ ((module) => {

module.exports = require("nodemailer");

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppConfigModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(11);
const app_config_1 = __webpack_require__(23);
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
                    app_config_1.articleServiceConfig,
                    app_config_1.cmdServiceConfig,
                ],
                envFilePath: ['.env.local', '.env'],
            }),
        ],
        exports: [config_1.ConfigModule],
    })
], AppConfigModule);


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apiGatewayConfig = exports.cmdServiceConfig = exports.articleServiceConfig = exports.notificationServiceConfig = exports.userServiceConfig = exports.authServiceConfig = exports.serviceConfig = exports.rateLimitConfig = exports.redisConfig = exports.emailConfig = exports.databaseConfig = void 0;
const config_1 = __webpack_require__(11);
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
exports.articleServiceConfig = (0, config_1.registerAs)('articleService', () => ({
    port: parseInt(process.env.ARTICLE_SERVICE_PORT || '3004', 10),
    microservicePort: parseInt(process.env.ARTICLE_MICROSERVICE_PORT || '4004', 10),
}));
exports.cmdServiceConfig = (0, config_1.registerAs)('cmdService', () => ({
    port: parseInt(process.env.CMD_SERVICE_PORT || '3005', 10),
    microservicePort: parseInt(process.env.CMD_MICROSERVICE_PORT || '4005', 10),
}));
exports.apiGatewayConfig = (0, config_1.registerAs)('apiGateway', () => ({
    port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
}));


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(25);
const passport_1 = __webpack_require__(26);
const config_1 = __webpack_require__(11);
const jwt_strategy_1 = __webpack_require__(27);
const jwt_guard_1 = __webpack_require__(29);
const token_blacklist_service_1 = __webpack_require__(30);
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
/* 25 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 26 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(26);
const passport_jwt_1 = __webpack_require__(28);
const config_1 = __webpack_require__(11);
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
/* 28 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(26);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenBlacklistService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(11);
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
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedRateLimitGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const throttler_1 = __webpack_require__(7);
const config_1 = __webpack_require__(11);
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
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const operators_1 = __webpack_require__(33);
const rxjs_1 = __webpack_require__(12);
const logging_util_1 = __webpack_require__(34);
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
/* 33 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 34 */
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
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResponseInterceptor = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const operators_1 = __webpack_require__(33);
const response_util_1 = __webpack_require__(36);
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
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginatedResponse = exports.ApiResponse = void 0;
const tslib_1 = __webpack_require__(5);
const swagger_1 = __webpack_require__(3);
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
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseEntity = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(18);
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
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VALIDATION_PATTERNS = exports.getGlobalValidationPipe = exports.IsValidLimit = exports.IsValidPagination = exports.IsValidUUID = exports.IsValidName = exports.IsStrongPassword = exports.IsValidEmail = void 0;
const class_validator_1 = __webpack_require__(39);
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
/* 39 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 40 */
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
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestUtils = void 0;
const testing_1 = __webpack_require__(42);
const common_1 = __webpack_require__(1);
const config_module_1 = __webpack_require__(22);
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
/* 42 */
/***/ ((module) => {

module.exports = require("@nestjs/testing");

/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_module_1 = __webpack_require__(22);
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
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const crypto = tslib_1.__importStar(__webpack_require__(45));
const bcrypt = tslib_1.__importStar(__webpack_require__(46));
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
/* 45 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 46 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var HealthService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(11);
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
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PinoLoggerService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const pino_1 = tslib_1.__importDefault(__webpack_require__(49));
const config_1 = __webpack_require__(11);
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
/* 49 */
/***/ ((module) => {

module.exports = require("pino");

/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var TracingService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TracingService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(11);
const crypto = tslib_1.__importStar(__webpack_require__(45));
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
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var MailProviderService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MailProviderService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(11);
const smtp_provider_1 = __webpack_require__(52);
const sendgrid_provider_1 = __webpack_require__(53);
const aws_ses_provider_1 = __webpack_require__(54);
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
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SmtpMailProvider = void 0;
const tslib_1 = __webpack_require__(5);
const nodemailer = tslib_1.__importStar(__webpack_require__(21));
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
/* 53 */
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
/* 54 */
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
/* 55 */
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
/* 56 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PolicyGuard = exports.RESOURCE_KEY = exports.POLICY_KEY = void 0;
exports.RequirePermission = RequirePermission;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const policy_service_1 = __webpack_require__(55);
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
/* 57 */
/***/ ((module) => {

module.exports = require("express");

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
const swagger_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3006',
            'http://127.0.0.1:3000',
            'http://localhost:4200',
            'http://127.0.0.1:4200',
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('You Fizz API Gateway')
        .setDescription('Central API Gateway for You Fizz microservices architecture. Provides unified access to all backend services including authentication, articles, orders, users, notifications, and statistics.')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('auth', 'Authentication and user management endpoints')
        .addTag('articles', 'Article management endpoints')
        .addTag('orders', 'Order/Command management endpoints')
        .addTag('profile', 'User profile endpoints')
        .addTag('notifications', 'Notification endpoints')
        .addTag('statistics', 'Statistics and analytics endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    const port = 3000;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    common_1.Logger.log(`📖 Swagger docs available on: http://localhost:${port}/${globalPrefix}-docs`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map