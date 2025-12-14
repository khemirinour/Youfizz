import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { DEFAULT_CATEGORIES } from '../constants/default-categories';

@Injectable()
export class CategorySeedService implements OnModuleInit {
  private readonly logger = new Logger(CategorySeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    // Only seed if no categories exist
    const existingCount = await this.categoryRepository.count();
    if (existingCount > 0) {
      this.logger.log('Categories already exist, skipping seed');
      return;
    }

    this.logger.log('Seeding default categories...');
    try {
      await this.seedCategories();
      this.logger.log('Default categories seeded successfully');
    } catch (error: any) {
      this.logger.error(`Failed to seed categories: ${error.message}`, error.stack);
    }
  }

  private async seedCategories() {
    // Create parent categories first
    const parentCategoryMap = new Map<string, Category>();

    for (const categoryData of DEFAULT_CATEGORIES) {
      // Check if category already exists by slug
      let parentCategory = await this.categoryRepository.findOne({
        where: { slug: categoryData.slug },
      });

      if (!parentCategory) {
        parentCategory = this.categoryRepository.create({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          order: categoryData.order,
          isActive: true,
        });
        parentCategory = await this.categoryRepository.save(parentCategory);
        this.logger.log(`Created parent category: ${parentCategory.name}`);
      }

      parentCategoryMap.set(categoryData.slug, parentCategory);

      // Create child categories
      if (categoryData.children && categoryData.children.length > 0) {
        for (const childData of categoryData.children) {
          const existingChild = await this.categoryRepository.findOne({
            where: { slug: childData.slug },
          });

          if (!existingChild) {
            const childCategory = this.categoryRepository.create({
              name: childData.name,
              slug: childData.slug,
              description: childData.description,
              parentId: parentCategory.id,
              order: childData.order,
              isActive: true,
            });
            await this.categoryRepository.save(childCategory);
            this.logger.log(`Created child category: ${childCategory.name} under ${parentCategory.name}`);
          }
        }
      }
    }
  }
}

