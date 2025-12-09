import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    try {
      // Generate slug if not provided
      let slug = dto.slug;
      if (!slug) {
        slug = this.generateSlug(dto.name);
      }

      // Check if slug already exists
      const existing = await this.categoryRepository.findOne({ where: { slug } });
      if (existing) {
        throw new BadRequestException(`Category with slug "${slug}" already exists`);
      }

      // Validate parent exists if provided
      if (dto.parentId) {
        const parent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
        if (!parent) {
          throw new NotFoundException(`Parent category with id "${dto.parentId}" not found`);
        }
      }

      const category = this.categoryRepository.create({
        ...dto,
        slug,
        isActive: dto.isActive ?? true,
        order: dto.order ?? 0,
      });

      const saved = await this.categoryRepository.save(category);
      return CategoryResponseDto.fromEntity(saved, true);
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create category');
    }
  }

  async findAll(includeInactive: boolean = false): Promise<CategoryResponseDto[]> {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await this.categoryRepository.find({
      where,
      relations: ['parent', 'children'],
      order: { order: 'ASC', name: 'ASC' },
    });

    return categories.map((cat) => CategoryResponseDto.fromEntity(cat, true));
  }

  async findTree(includeInactive: boolean = false): Promise<CategoryResponseDto[]> {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    // Get all root categories (no parent)
    const rootCategories = await this.categoryRepository.find({
      where: { ...where, parentId: null },
      relations: ['children'],
      order: { order: 'ASC', name: 'ASC' },
    });

    // Recursively load children
    const loadChildren = async (category: Category): Promise<CategoryResponseDto> => {
      const children = await this.categoryRepository.find({
        where: { parentId: category.id, ...(includeInactive ? {} : { isActive: true }) },
        relations: ['children'],
        order: { order: 'ASC', name: 'ASC' },
      });

      const childrenDtos = await Promise.all(children.map(loadChildren));

      const dto = CategoryResponseDto.fromEntity(category, false);
      dto.children = childrenDtos;
      return dto;
    };

    return Promise.all(rootCategories.map(loadChildren));
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return CategoryResponseDto.fromEntity(category, true);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    // Validate parent if being changed
    if (dto.parentId !== undefined && dto.parentId !== category.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      if (dto.parentId) {
        const parent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
        if (!parent) {
          throw new NotFoundException(`Parent category with id "${dto.parentId}" not found`);
        }
        // Check for circular reference
        if (await this.isDescendant(dto.parentId, id)) {
          throw new BadRequestException('Cannot set parent: would create circular reference');
        }
      }
    }

    // Generate slug if name changed and slug not provided
    if (dto.name && !dto.slug) {
      dto.slug = this.generateSlug(dto.name);
    }

    // Check slug uniqueness if slug changed
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new BadRequestException(`Category with slug "${dto.slug}" already exists`);
      }
    }

    Object.assign(category, dto);
    const saved = await this.categoryRepository.save(category);
    return CategoryResponseDto.fromEntity(saved, true);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with children. Delete or move children first.');
    }

    await this.categoryRepository.remove(category);
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    if (ids.length === 0) return [];
    return this.categoryRepository.find({ where: { id: In(ids) } });
  }

  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    const category = await this.categoryRepository.findOne({
      where: { id: descendantId },
      relations: ['parent'],
    });

    if (!category || !category.parentId) {
      return false;
    }

    if (category.parentId === ancestorId) {
      return true;
    }

    return this.isDescendant(ancestorId, category.parentId);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}

