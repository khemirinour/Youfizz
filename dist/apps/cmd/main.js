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
const app_service_1 = __webpack_require__(9);
const shared_1 = __webpack_require__(14);
const typeorm_1 = __webpack_require__(10);
const order_entity_1 = __webpack_require__(13);
const passport_1 = __webpack_require__(26);
const jwt_1 = __webpack_require__(25);
const shared_2 = __webpack_require__(14);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            shared_1.SharedModule,
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order]),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') },
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, shared_2.JwtStrategy],
    })
], AppModule);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const express_1 = __webpack_require__(8);
const swagger_1 = __webpack_require__(4);
const app_service_1 = __webpack_require__(9);
const create_order_dto_1 = __webpack_require__(59);
const update_order_dto_1 = __webpack_require__(61);
const query_orders_dto_1 = __webpack_require__(62);
const shared_1 = __webpack_require__(14);
const roles_decorator_1 = __webpack_require__(63);
const roles_guard_1 = __webpack_require__(64);
const order_entity_1 = __webpack_require__(13);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    list(query) {
        return this.appService.findAll(query);
    }
    create(dto) {
        return this.appService.create(dto);
    }
    get(id) {
        return this.appService.findOne(id);
    }
    update(id, dto) {
        return this.appService.update(id, dto);
    }
    delete(id) {
        return this.appService.remove(id);
    }
    confirm(id, req) {
        // Extract user data from JWT token (same logic as login token)
        const user = req.user; // Type assertion to avoid linter conflicts
        const userData = {
            userId: user?.userId, // User ID from token
            role: user?.role, // User role
            vendorId: user?.vendorId, // Vendor ID from token (if vendeur)
            confirmateurId: user?.confirmateurId, // Confirmateur ID from token (if confirmateur)
        };
        return this.appService.confirm(id, userData);
    }
    activate(id) {
        return this.appService.setActive(id, true);
    }
    deactivate(id) {
        return this.appService.setActive(id, false);
    }
    async getOrderStats() {
        return this.appService.getOrderStats();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List orders' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Order number contains' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'vendorId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, schema: { default: 20, minimum: 1 } }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, schema: { default: 0, minimum: 0 } }),
    (0, swagger_1.ApiOkResponse)({ description: 'Orders retrieved', type: [order_entity_1.Order] }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof query_orders_dto_1.QueryOrdersDto !== "undefined" && query_orders_dto_1.QueryOrdersDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "list", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create order (guest allowed)' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Order created', type: order_entity_1.Order }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof create_order_dto_1.CreateOrderDto !== "undefined" && create_order_dto_1.CreateOrderDto) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by id' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Order retrieved', type: order_entity_1.Order }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "get", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'VENDEUR', 'CONFIRMATEUR'),
    (0, swagger_1.ApiOkResponse)({ description: 'Order updated', type: order_entity_1.Order }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role' }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_d = typeof update_order_dto_1.UpdateOrderDto !== "undefined" && update_order_dto_1.UpdateOrderDto) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete order' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOkResponse)({ description: 'Order deleted' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role' }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "delete", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm order' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('VENDEUR', 'CONFIRMATEUR'),
    (0, swagger_1.ApiOkResponse)({ description: 'Order confirmed', type: order_entity_1.Order }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "confirm", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate order (active)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'VENDEUR', 'CONFIRMATEUR'),
    (0, swagger_1.ApiOkResponse)({ description: 'Order activated', type: order_entity_1.Order }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "activate", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate order (inactive)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'VENDEUR', 'CONFIRMATEUR'),
    (0, swagger_1.ApiOkResponse)({ description: 'Order deactivated', type: order_entity_1.Order }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "deactivate", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats/orders'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin: Get order statistics',
        description: 'Returns comprehensive statistics about orders including total count, breakdown by status, paid/unpaid counts, active/inactive counts, and total revenue.'
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(shared_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOkResponse)({
        description: 'Order statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number', description: 'Total number of orders' },
                byStatus: {
                    type: 'object',
                    description: 'Orders count by status',
                    additionalProperties: { type: 'number' },
                    example: { PENDING: 10, CONFIRMED: 5, SHIPPED: 3, DELIVERED: 20, CANCELLED: 2 }
                },
                paid: { type: 'number', description: 'Number of paid orders' },
                unpaid: { type: 'number', description: 'Number of unpaid orders' },
                active: { type: 'number', description: 'Number of active orders' },
                inactive: { type: 'number', description: 'Number of inactive orders' },
                totalRevenue: { type: 'number', description: 'Total revenue from all orders' }
            }
        }
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Insufficient role - Admin required' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getOrderStats", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const axios_1 = tslib_1.__importDefault(__webpack_require__(11));
const typeorm_2 = __webpack_require__(12);
const order_entity_1 = __webpack_require__(13);
let AppService = class AppService {
    constructor(repo) {
        this.repo = repo;
    }
    findAll(query) {
        const where = {};
        if (query.search)
            where.number = (0, typeorm_2.ILike)(`%${query.search}%`);
        if (query.status)
            where.status = query.status;
        if (query.customerName)
            where.customerName = (0, typeorm_2.ILike)(`%${query.customerName}%`);
        if (query.customerEmail)
            where.customerEmail = (0, typeorm_2.ILike)(`%${query.customerEmail}%`);
        if (query.customerPhone)
            where.customerPhone = (0, typeorm_2.ILike)(`%${query.customerPhone}%`);
        if (query.vendorId)
            where.vendorId = query.vendorId;
        if (typeof query.isActive === 'boolean')
            where.isActive = query.isActive;
        return this.repo.find({ where, take: query.limit, skip: query.offset, order: { createdAt: 'DESC' } });
    }
    findOne(id) { return this.repo.findOne({ where: { id } }); }
    async create(data) {
        const lastOrders = await this.repo.find({
            order: { createdAt: 'DESC' },
            take: 1,
        });
        if (lastOrders.length > 0) {
            const lastOrder = lastOrders[0];
            const lastNumber = parseInt(lastOrder.number.split('-')[1]);
            data.number = `ORDER-${(lastNumber + 1).toString().padStart(3, '0')}`;
        }
        else {
            data.number = 'ORDER-001';
        }
        const entity = this.repo.create(data);
        return this.repo.save(entity);
    }
    async update(id, dto) {
        await this.repo.update({ id }, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete({ id });
        return { id };
    }
    async setActive(id, active) {
        await this.repo.update({ id }, { isActive: active });
        return this.findOne(id);
    }
    async confirm(id, confirmer) {
        const order = await this.findOne(id);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        // Enforce vendor quota via auth internal APIs: check (GET) then consume (POST)
        if (confirmer?.role === 'VENDEUR' || confirmer?.role === 'CONFIRMATEUR') {
            if (order.vendorId && order.vendorId !== confirmer.vendorId) {
                throw new common_1.ForbiddenException();
            }
            // Use same logic as login token: get user ID and vendor ID from token
            const vendorUserId = confirmer.userId; // userId from token (same as login logic)
            const vendorId = confirmer.vendorId; // vendorId from token (same as login logic)
            try {
                // 1) Check remaining via GET
                const params = vendorId ? { vendorId } : { vendorUserId };
                const check = await axios_1.default.get('http://localhost:3001/api/internal/vendors/confirm-quota', {
                    params,
                    timeout: 5000,
                });
                if (!check?.data || typeof check.data.remaining !== 'number' || check.data.remaining <= 0) {
                    throw { statusCode: 403, message: 'Vendor has no remaining confirmations' };
                }
                // 2) Consume quota via POST to keep atomicity on auth side
                const body = vendorId ? { vendorId } : { vendorUserId };
                await axios_1.default.post('http://localhost:3001/api/internal/vendors/confirm-quota/consume', body, { timeout: 5000 });
            }
            catch (e) {
                throw e?.response?.data ?? e;
            }
        }
        await this.repo.update({ id }, { status: order_entity_1.OrderStatus.CONFIRMED, isActive: true });
        return this.findOne(id);
    }
    async getOrderStats() {
        const [total, byStatus, paidCount, unpaidCount, activeCount, inactiveCount] = await Promise.all([
            this.repo.count(),
            this.repo
                .createQueryBuilder('order')
                .select('order.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .groupBy('order.status')
                .getRawMany(),
            this.repo.count({ where: { isPaid: true } }),
            this.repo.count({ where: { isPaid: false } }),
            this.repo.count({ where: { isActive: true } }),
            this.repo.count({ where: { isActive: false } }),
        ]);
        const byStatusMap = {};
        byStatus.forEach((item) => {
            byStatusMap[item.status] = parseInt(item.count, 10);
        });
        // Calculate total revenue (sum of all order totals)
        const revenueResult = await this.repo
            .createQueryBuilder('order')
            .select('SUM(order.total::numeric)', 'total')
            .getRawOne();
        const totalRevenue = revenueResult?.total ? parseFloat(revenueResult.total) : 0;
        return {
            total,
            byStatus: byStatusMap,
            paid: paidCount,
            unpaid: unpaidCount,
            active: activeCount,
            inactive: inactiveCount,
            totalRevenue,
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("axios");

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Order = exports.OrderStatus = void 0;
const tslib_1 = __webpack_require__(6);
const shared_1 = __webpack_require__(14);
const typeorm_1 = __webpack_require__(12);
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let Order = class Order extends shared_1.BaseEntity {
};
exports.Order = Order;
tslib_1.__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, unique: true }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "number", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Array !== "undefined" && Array) === "function" ? _a : Object)
], Order.prototype, "items", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2 }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "total", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "customerName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "customerEmail", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "customerPhone", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "customerAddress", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "vendorId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Order.prototype, "isPaid", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], Order.prototype, "isActive", void 0);
exports.Order = Order = tslib_1.__decorate([
    (0, typeorm_1.Entity)('orders')
], Order);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(6);
tslib_1.__exportStar(__webpack_require__(15), exports);
tslib_1.__exportStar(__webpack_require__(16), exports);
tslib_1.__exportStar(__webpack_require__(18), exports);
tslib_1.__exportStar(__webpack_require__(39), exports);
tslib_1.__exportStar(__webpack_require__(19), exports);
tslib_1.__exportStar(__webpack_require__(20), exports);
tslib_1.__exportStar(__webpack_require__(38), exports);
tslib_1.__exportStar(__webpack_require__(40), exports);
tslib_1.__exportStar(__webpack_require__(42), exports);
tslib_1.__exportStar(__webpack_require__(36), exports);
tslib_1.__exportStar(__webpack_require__(22), exports);
tslib_1.__exportStar(__webpack_require__(31), exports);
tslib_1.__exportStar(__webpack_require__(33), exports);
tslib_1.__exportStar(__webpack_require__(37), exports);
tslib_1.__exportStar(__webpack_require__(43), exports);
tslib_1.__exportStar(__webpack_require__(45), exports);
tslib_1.__exportStar(__webpack_require__(24), exports);
tslib_1.__exportStar(__webpack_require__(29), exports);
tslib_1.__exportStar(__webpack_require__(27), exports);
tslib_1.__exportStar(__webpack_require__(30), exports);
tslib_1.__exportStar(__webpack_require__(46), exports);
tslib_1.__exportStar(__webpack_require__(49), exports);
tslib_1.__exportStar(__webpack_require__(50), exports);
tslib_1.__exportStar(__webpack_require__(52), exports);
tslib_1.__exportStar(__webpack_require__(53), exports);
tslib_1.__exportStar(__webpack_require__(57), exports);
tslib_1.__exportStar(__webpack_require__(58), exports);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const database_module_1 = __webpack_require__(16);
const database_service_1 = __webpack_require__(18);
const email_module_1 = __webpack_require__(19);
const config_module_1 = __webpack_require__(22);
const auth_module_1 = __webpack_require__(24);
const rate_limit_guard_1 = __webpack_require__(31);
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
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const config_1 = __webpack_require__(17);
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
/* 17 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(10);
const typeorm_2 = __webpack_require__(12);
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
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailModule = void 0;
const tslib_1 = __webpack_require__(6);
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
const tslib_1 = __webpack_require__(6);
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
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(17);
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
exports.apiGatewayConfig = exports.notificationServiceConfig = exports.userServiceConfig = exports.authServiceConfig = exports.serviceConfig = exports.rateLimitConfig = exports.redisConfig = exports.emailConfig = exports.databaseConfig = void 0;
const config_1 = __webpack_require__(17);
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
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(25);
const passport_1 = __webpack_require__(26);
const config_1 = __webpack_require__(17);
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
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(26);
const passport_jwt_1 = __webpack_require__(28);
const config_1 = __webpack_require__(17);
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
const tslib_1 = __webpack_require__(6);
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
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(17);
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
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const throttler_1 = __webpack_require__(32);
const config_1 = __webpack_require__(17);
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
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const tslib_1 = __webpack_require__(6);
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
const tslib_1 = __webpack_require__(6);
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
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
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
const tslib_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(12);
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
/* 44 */
/***/ ((module) => {

module.exports = require("@nestjs/testing");

/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestModule = void 0;
const tslib_1 = __webpack_require__(6);
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
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenService = void 0;
const tslib_1 = __webpack_require__(6);
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
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(17);
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
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const pino_1 = tslib_1.__importDefault(__webpack_require__(51));
const config_1 = __webpack_require__(17);
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
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(17);
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
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(17);
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
const tslib_1 = __webpack_require__(6);
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
const tslib_1 = __webpack_require__(6);
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
const tslib_1 = __webpack_require__(6);
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


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateOrderDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(41);
const class_transformer_1 = __webpack_require__(60);
class OrderItemDto {
}
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], OrderItemDto.prototype, "articleId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], OrderItemDto.prototype, "qty", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Decimal string' }),
    (0, class_validator_1.IsNumberString)(),
    tslib_1.__metadata("design:type", String)
], OrderItemDto.prototype, "price", void 0);
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrderItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    tslib_1.__metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Decimal string' }),
    (0, class_validator_1.IsNumberString)(),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "customerId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "customerName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "customerEmail", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "customerPhone", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "customerAddress", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "vendorId", void 0);


/***/ }),
/* 60 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 61 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateOrderDto = void 0;
const swagger_1 = __webpack_require__(4);
const create_order_dto_1 = __webpack_require__(59);
class UpdateOrderDto extends (0, swagger_1.PartialType)(create_order_dto_1.CreateOrderDto) {
}
exports.UpdateOrderDto = UpdateOrderDto;


/***/ }),
/* 62 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryOrdersDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(60);
const class_validator_1 = __webpack_require__(41);
const order_entity_1 = __webpack_require__(13);
class QueryOrdersDto {
    constructor() {
        this.limit = 20;
        this.offset = 0;
    }
}
exports.QueryOrdersDto = QueryOrdersDto;
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QueryOrdersDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: order_entity_1.OrderStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(order_entity_1.OrderStatus),
    tslib_1.__metadata("design:type", typeof (_a = typeof order_entity_1.OrderStatus !== "undefined" && order_entity_1.OrderStatus) === "function" ? _a : Object)
], QueryOrdersDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QueryOrdersDto.prototype, "customerName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QueryOrdersDto.prototype, "customerEmail", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QueryOrdersDto.prototype, "customerPhone", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QueryOrdersDto.prototype, "vendorId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by active' }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], QueryOrdersDto.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 200, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    tslib_1.__metadata("design:type", Number)
], QueryOrdersDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], QueryOrdersDto.prototype, "offset", void 0);


/***/ }),
/* 63 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 64 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const roles_decorator_1 = __webpack_require__(63);
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
        return requiredRoles.some(requiredRole => requiredRole === user.role ||
            requiredRole === user.role?.toUpperCase() ||
            requiredRole.toUpperCase() === user.role?.toUpperCase());
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


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
        options: { port: 4005 },
    });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Command Service')
        .setDescription('Command API')
        .setVersion('1.0')
        .addTag('cmd')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    await app.startAllMicroservices();
    const port = 3005;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    common_1.Logger.log(`🚀 Microservice is listening on TCP port: 4005`);
    common_1.Logger.log(`📖 Swagger docs available on: http://localhost:${port}/api-docs`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map