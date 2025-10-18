import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { QueryArticlesDto } from '../dto/query-articles.dto';
import { JwtAuthGuard } from '@you-fizz/shared';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { ArticleResponseDto } from '../dto/article-response.dto';

@ApiTags('articles')
@Controller('articles')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'article',
    };
  }

  @Get()
  @ApiOperation({ summary: 'List articles', description: 'Returns paginated list of articles. Use filters for search, category, vendor, status, and visibility.' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title (ILIKE %search%)' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT','PUBLISHED','ARCHIVED'] })
  @ApiQuery({ name: 'isActive', required: false, description: 'true to show only active, false for inactive' })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 20, minimum: 1 } })
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, minimum: 0 } })
  @ApiOkResponse({ description: 'Articles retrieved', type: [ArticleResponseDto] })
  list(@Query() query: QueryArticlesDto) {
    return this.appService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create article' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @ApiCreatedResponse({ description: 'Article created', type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  create(@Body() dto: CreateArticleDto) {
    return this.appService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by id' })
  @ApiOkResponse({ description: 'Article retrieved', type: ArticleResponseDto })
  get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.findOne(id);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get articles by vendor id' })
  @ApiOkResponse({ description: 'Articles retrieved', type: [ArticleResponseDto] })
  getByVendor(@Param('vendorId', new ParseUUIDPipe()) vendorId: string) {
    return this.appService.findByVendor(vendorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update article by id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @ApiOkResponse({ description: 'Article updated', type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.appService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete article by id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','vendeur')
  @ApiOkResponse({ description: 'Article deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate article (visible)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @ApiOkResponse({ description: 'Article activated', type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiOperation({ summary: 'Set article visible/active' })
  activate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.setActive(id, true);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate article (hidden)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @ApiOkResponse({ description: 'Article deactivated', type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiOperation({ summary: 'Set article hidden/inactive' })
  deactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.setActive(id, false);
  }
}


