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
const shared_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(9);
const order_entity_1 = __webpack_require__(12);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [shared_1.SharedModule, typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order])],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const app_service_1 = __webpack_require__(8);
const create_order_dto_1 = __webpack_require__(19);
const update_order_dto_1 = __webpack_require__(22);
const query_orders_dto_1 = __webpack_require__(23);
const jwt_auth_guard_1 = __webpack_require__(24);
const roles_decorator_1 = __webpack_require__(26);
const roles_guard_1 = __webpack_require__(27);
const order_entity_1 = __webpack_require__(12);
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
    confirm(id) {
        const req = arguments[0]?.switchToHttp?.()?.getRequest?.();
        return this.appService.confirm(id, req?.user);
    }
    activate(id) {
        return this.appService.setActive(id, true);
    }
    deactivate(id) {
        return this.appService.setActive(id, false);
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('VENDEUR', 'CONFIRMATEUR'),
    (0, swagger_1.ApiOkResponse)({ description: 'Order confirmed', type: order_entity_1.Order }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "confirm", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate order (active)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'VENDEUR', 'CONFIRMATEUR'),
    (0, swagger_1.ApiOkResponse)({ description: 'Order deactivated', type: order_entity_1.Order }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "deactivate", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(9);
const axios_1 = tslib_1.__importDefault(__webpack_require__(10));
const typeorm_2 = __webpack_require__(11);
const order_entity_1 = __webpack_require__(12);
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
        if (query.customerId)
            where.customerId = query.customerId;
        if (query.vendorId)
            where.vendorId = query.vendorId;
        if (typeof query.isActive === 'boolean')
            where.isActive = query.isActive;
        return this.repo.find({ where, take: query.limit, skip: query.offset, order: { createdAt: 'DESC' } });
    }
    findOne(id) { return this.repo.findOne({ where: { id } }); }
    async create(data) {
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
        // Enforce vendor quota via auth internal APIs: check (GET) then consume (POST)
        if (confirmer?.role === 'VENDEUR' || confirmer?.role === 'CONFIRMATEUR') {
            const vendorUserId = confirmer.id;
            const vendorId = confirmer.vendorId;
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
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("axios");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Order = exports.OrderStatus = void 0;
const tslib_1 = __webpack_require__(6);
const shared_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(11);
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
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "customerId", void 0);
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
const typeorm_1 = __webpack_require__(9);
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
const typeorm_1 = __webpack_require__(9);
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


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateOrderDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(20);
const class_transformer_1 = __webpack_require__(21);
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
    (0, swagger_1.ApiProperty)({ maxLength: 30 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "number", void 0);
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
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "vendorId", void 0);


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateOrderDto = void 0;
const swagger_1 = __webpack_require__(4);
const create_order_dto_1 = __webpack_require__(19);
class UpdateOrderDto extends (0, swagger_1.PartialType)(create_order_dto_1.CreateOrderDto) {
}
exports.UpdateOrderDto = UpdateOrderDto;


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryOrdersDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(21);
const class_validator_1 = __webpack_require__(20);
const order_entity_1 = __webpack_require__(12);
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
], QueryOrdersDto.prototype, "customerId", void 0);
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
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const jwt = tslib_1.__importStar(__webpack_require__(25));
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
/* 25 */
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const roles_decorator_1 = __webpack_require__(26);
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