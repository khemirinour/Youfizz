import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Delete, UseGuards, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException, Headers, Req } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'categoryIds', required: false, type: [String], isArray: true, description: 'Array of category IDs' })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT','PUBLISHED','ARCHIVED'] })
  @ApiQuery({ name: 'isActive', required: false, description: 'true to show only active, false for inactive' })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'minStock', required: false })
  @ApiQuery({ name: 'maxStock', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 20, minimum: 1 } })
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, minimum: 0 } })
  @ApiOkResponse({ description: 'Articles retrieved', type: [ArticleResponseDto] })
  list(@Query() query: QueryArticlesDto, @Req() req: Request) {
    // Handle categoryIds[] format from query string
    const rawQuery = req.query as any;
    if (rawQuery['categoryIds[]']) {
      const categoryIdsArray = Array.isArray(rawQuery['categoryIds[]']) 
        ? rawQuery['categoryIds[]'] 
        : [rawQuery['categoryIds[]']];
      query.categoryIds = categoryIdsArray.filter((id: any) => id);
    }
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
  @ApiOperation({ summary: 'Get articles by vendor id with pagination and filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT','PUBLISHED','ARCHIVED'] })
  @ApiQuery({ name: 'isActive', required: false, description: 'true for active, false for inactive' })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 20, minimum: 1 } })
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, minimum: 0 } })
  @ApiOkResponse({ description: 'Paginated articles retrieved', type: [ArticleResponseDto] })
  getByVendor(
    @Param('vendorId', new ParseUUIDPipe()) vendorId: string,
    @Query() query: QueryArticlesDto
  ) {
    return this.appService.findByVendor(vendorId, query);
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
  deactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.setActive(id, false);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload single image to article', description: 'Upload a single image and add it to the article\'s images array' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Article ID', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['image'],
    },
  })
  @ApiOkResponse({ description: 'Image uploaded and added to article', type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiResponse({ status: 400, description: 'Article not found or invalid file' })
  async uploadImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    // Get authorization header from request (handle both lowercase and capitalized)
    const authHeader = authorization || 
      (typeof req?.headers?.authorization === 'string' ? req.headers.authorization : undefined) ||
      (typeof req?.headers?.Authorization === 'string' ? req.headers.Authorization : undefined);
    const imageUrl = await this.appService.uploadImage(file, id, authHeader);
    return this.appService.addImageToArticle(id, imageUrl);
  }

  @Post(':id/images/multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload multiple images to article', description: 'Upload multiple images (max 10) and add them to the article\'s images array' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Article ID', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['images'],
    },
  })
  @ApiOkResponse({ description: 'Images uploaded and added to article', type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiResponse({ status: 400, description: 'Article not found or invalid files' })
  async uploadMultipleImages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('authorization') authorization?: string,
    @Req() req?: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    // Get authorization header from request (handle both lowercase and capitalized)
    const authHeader = authorization || 
      (typeof req?.headers?.authorization === 'string' ? req.headers.authorization : undefined) ||
      (typeof req?.headers?.Authorization === 'string' ? req.headers.Authorization : undefined);
    const imageUrls = await this.appService.uploadMultipleImages(files, id, authHeader);
    return this.appService.addImagesToArticle(id, imageUrls);
  }

  @Delete(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove image from article', description: 'Remove an image URL from the article\'s images array' })
  @ApiParam({ name: 'id', description: 'Article ID', type: String })
  @ApiQuery({ name: 'imageUrl', description: 'Image URL to remove', type: String, required: true })
  @ApiOkResponse({ description: 'Image removed from article', type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiResponse({ status: 400, description: 'Article not found' })
  async removeImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('imageUrl') imageUrl: string,
  ) {
    if (!imageUrl) {
      throw new BadRequestException('imageUrl query parameter is required');
    }
    return this.appService.removeImageFromArticle(id, imageUrl);
  }

  @Get('stats/articles')
  @ApiOperation({ 
    summary: 'Admin: Get article statistics',
    description: 'Returns comprehensive statistics about articles including total count, breakdown by status, active/inactive counts, and total stock quantity.'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOkResponse({ 
    description: 'Article statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of articles' },
        byStatus: { 
          type: 'object', 
          description: 'Articles count by status',
          additionalProperties: { type: 'number' },
          example: { DRAFT: 5, PUBLISHED: 20, ARCHIVED: 3 }
        },
        active: { type: 'number', description: 'Number of active articles' },
        inactive: { type: 'number', description: 'Number of inactive articles' },
        totalStock: { type: 'number', description: 'Total stock quantity across all articles' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  async getArticleStats() {
    return this.appService.getArticleStats();
  }
}


