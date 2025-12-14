import { BadRequestException, Body, Controller, Get, Logger, NotFoundException, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';

@ApiTags('internal')
@Controller('internal/articles')
export class ArticlesInternalController {
  private readonly logger = new Logger(ArticlesInternalController.name);
  
  constructor(
    @InjectRepository(Article) private readonly articleRepo: Repository<Article>,
  ) {}

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get article by id (internal)',
    description: 'Internal endpoint to retrieve article by ID. No authentication required.'
  })
  @ApiParam({ name: 'id', description: 'Article ID', type: String })
  @ApiOkResponse({ 
    description: 'Article retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        stock: { type: 'number' },
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  async getArticle(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.log(`Getting article ${id} stock`);
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    this.logger.log(`Article ${id} current stock: ${article.stock}`);
    return { id: article.id, stock: article.stock };
  }

  @Patch(':id/stock')
  @ApiOperation({ 
    summary: 'Update article stock (internal)',
    description: 'Internal endpoint to update article stock quantity. No authentication required. Used by order service when orders are confirmed.'
  })
  @ApiParam({ name: 'id', description: 'Article ID', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stock: { type: 'number', description: 'New stock quantity' },
      },
      required: ['stock'],
      example: {
        stock: 10
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Stock updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        stock: { type: 'number' },
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid stock value' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  async updateStock(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { stock: number }
  ) {
    this.logger.log(`Updating stock for article ${id} to ${body.stock}`);
    
    if (typeof body.stock !== 'number') {
      throw new BadRequestException('stock must be a number');
    }
    
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    
    const oldStock = article.stock;
    await this.articleRepo.update({ id }, { stock: body.stock });
    const updated = await this.articleRepo.findOne({ where: { id } });
    
    this.logger.log(`Stock updated for article ${id}: ${oldStock} -> ${updated!.stock}`);
    
    return { id: updated!.id, stock: updated!.stock };
  }
}

