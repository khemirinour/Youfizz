import { BaseEntity } from '@you-fizz/shared';
import { Entity, ManyToOne, JoinColumn, Index, Unique, Column } from 'typeorm';
import { Article } from './article.entity';
import { Category } from './category.entity';

@Entity('article_categories')
@Unique(['articleId', 'categoryId'])
@Index(['articleId'])
@Index(['categoryId'])
export class ArticleCategory extends BaseEntity {
  @Column({ type: 'uuid' })
  articleId!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => Article, (article) => article.articleCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articleId' })
  article!: Article;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;
}

