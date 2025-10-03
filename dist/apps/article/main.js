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
const shared_1 = __webpack_require__(12);
const typeorm_1 = __webpack_require__(9);
const article_entity_1 = __webpack_require__(11);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [shared_1.SharedModule, typeorm_1.TypeOrmModule.forFeature([article_entity_1.Article])],
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
const create_article_dto_1 = __webpack_require__(18);
const update_article_dto_1 = __webpack_require__(20);
const query_articles_dto_1 = __webpack_require__(21);
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
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ description: 'List articles' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof query_articles_dto_1.QueryArticlesDto !== "undefined" && query_articles_dto_1.QueryArticlesDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "list", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Article created' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof create_article_dto_1.CreateArticleDto !== "undefined" && create_article_dto_1.CreateArticleDto) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Get article by id' }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "get", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Update article by id' }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_d = typeof update_article_dto_1.UpdateArticleDto !== "undefined" && update_article_dto_1.UpdateArticleDto) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Delete article by id' }),
    tslib_1.__param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "delete", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Controller)('articles'),
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
const typeorm_2 = __webpack_require__(10);
const article_entity_1 = __webpack_require__(11);
let AppService = class AppService {
    constructor(articleRepository) {
        this.articleRepository = articleRepository;
    }
    getData() {
        return { message: 'Article Service' };
    }
    findAll(query) {
        const where = {};
        if (query.categoryId)
            where.categoryId = query.categoryId;
        if (query.vendorId)
            where.vendorId = query.vendorId;
        if (query.status)
            where.status = query.status;
        if (query.search)
            where.title = (0, typeorm_2.ILike)(`%${query.search}%`);
        return this.articleRepository.find({
            where,
            take: query.limit,
            skip: query.offset,
            order: { title: 'ASC' },
        });
    }
    findOne(id) {
        return this.articleRepository.findOne({ where: { id } });
    }
    async create(data) {
        try {
            const entity = this.articleRepository.create(data);
            return await this.articleRepository.save(entity);
        }
        catch (error) {
            throw error;
        }
    }
    async update(id, data) {
        await this.articleRepository.update({ id }, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.articleRepository.delete({ id });
        return { id };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Article = exports.ArticleStatus = void 0;
const tslib_1 = __webpack_require__(6);
const shared_1 = __webpack_require__(12);
const typeorm_1 = __webpack_require__(10);
var ArticleStatus;
(function (ArticleStatus) {
    ArticleStatus["DRAFT"] = "DRAFT";
    ArticleStatus["PUBLISHED"] = "PUBLISHED";
    ArticleStatus["ARCHIVED"] = "ARCHIVED";
})(ArticleStatus || (exports.ArticleStatus = ArticleStatus = {}));
let Article = class Article extends shared_1.BaseEntity {
};
exports.Article = Article;
tslib_1.__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 160 }),
    tslib_1.__metadata("design:type", String)
], Article.prototype, "title", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], Article.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2, default: 0 }),
    tslib_1.__metadata("design:type", String)
], Article.prototype, "price", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], Article.prototype, "stock", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Article.prototype, "sku", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Article.prototype, "categoryId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    tslib_1.__metadata("design:type", String)
], Article.prototype, "vendorId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    tslib_1.__metadata("design:type", Array)
], Article.prototype, "images", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT }),
    tslib_1.__metadata("design:type", String)
], Article.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], Article.prototype, "metadata", void 0);
exports.Article = Article = tslib_1.__decorate([
    (0, typeorm_1.Entity)('articles')
], Article);


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(6);
tslib_1.__exportStar(__webpack_require__(13), exports);
tslib_1.__exportStar(__webpack_require__(14), exports);
tslib_1.__exportStar(__webpack_require__(16), exports);
tslib_1.__exportStar(__webpack_require__(17), exports);


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const database_module_1 = __webpack_require__(14);
const database_service_1 = __webpack_require__(16);
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
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(9);
const config_1 = __webpack_require__(15);
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
/* 15 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(9);
const typeorm_2 = __webpack_require__(10);
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
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseEntity = void 0;
const tslib_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(10);
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
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateArticleDto = void 0;
const tslib_1 = __webpack_require__(6);
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(4);
const article_entity_1 = __webpack_require__(11);
class CreateArticleDto {
}
exports.CreateArticleDto = CreateArticleDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ maxLength: 160 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    tslib_1.__metadata("design:type", String)
], CreateArticleDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateArticleDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Decimal string, e.g. 19.99' }),
    (0, class_validator_1.IsNumberString)(),
    tslib_1.__metadata("design:type", String)
], CreateArticleDto.prototype, "price", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    tslib_1.__metadata("design:type", Number)
], CreateArticleDto.prototype, "stock", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateArticleDto.prototype, "sku", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateArticleDto.prototype, "categoryId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateArticleDto.prototype, "vendorId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreateArticleDto.prototype, "images", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: article_entity_1.ArticleStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(article_entity_1.ArticleStatus),
    tslib_1.__metadata("design:type", typeof (_a = typeof article_entity_1.ArticleStatus !== "undefined" && article_entity_1.ArticleStatus) === "function" ? _a : Object)
], CreateArticleDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Object }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateArticleDto.prototype, "metadata", void 0);


/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateArticleDto = void 0;
const swagger_1 = __webpack_require__(4);
const create_article_dto_1 = __webpack_require__(18);
class UpdateArticleDto extends (0, swagger_1.PartialType)(create_article_dto_1.CreateArticleDto) {
}
exports.UpdateArticleDto = UpdateArticleDto;


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryArticlesDto = void 0;
const tslib_1 = __webpack_require__(6);
const class_transformer_1 = __webpack_require__(22);
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(4);
const article_entity_1 = __webpack_require__(11);
class QueryArticlesDto {
    constructor() {
        this.limit = 20;
        this.offset = 0;
    }
}
exports.QueryArticlesDto = QueryArticlesDto;
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QueryArticlesDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QueryArticlesDto.prototype, "categoryId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], QueryArticlesDto.prototype, "vendorId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: article_entity_1.ArticleStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(article_entity_1.ArticleStatus),
    tslib_1.__metadata("design:type", typeof (_a = typeof article_entity_1.ArticleStatus !== "undefined" && article_entity_1.ArticleStatus) === "function" ? _a : Object)
], QueryArticlesDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 200, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    tslib_1.__metadata("design:type", Number)
], QueryArticlesDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], QueryArticlesDto.prototype, "offset", void 0);


/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("class-transformer");

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
        options: { port: 4004 },
    });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Article Service')
        .setDescription('Article API')
        .setVersion('1.0')
        .addTag('article')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    await app.startAllMicroservices();
    const port = 3004;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    common_1.Logger.log(`🚀 Microservice is listening on TCP port: 4004`);
    common_1.Logger.log(`📖 Swagger docs available on: http://localhost:${port}/api-docs`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map