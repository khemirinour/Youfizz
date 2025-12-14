import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { JwtAuthGuard } from '@you-fizz/shared';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category' })
  @ApiCreatedResponse({ description: 'Category created', type: CategoryResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all categories', description: 'Returns flat list of all categories' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive categories' })
  @ApiOkResponse({ description: 'Categories retrieved', type: [CategoryResponseDto] })
  findAll(@Query('includeInactive') includeInactive?: string): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll(includeInactive === 'true');
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree', description: 'Returns hierarchical tree structure of categories' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive categories' })
  @ApiOkResponse({ description: 'Category tree retrieved', type: [CategoryResponseDto] })
  findTree(@Query('includeInactive') includeInactive?: string): Promise<CategoryResponseDto[]> {
    return this.categoryService.findTree(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({ description: 'Category retrieved', type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendeur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category by id' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({ description: 'Category updated', type: CategoryResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category by id (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({ description: 'Category deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient role - Admin required' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.categoryService.remove(id);
  }
}

