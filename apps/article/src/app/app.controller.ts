import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Delete } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { QueryArticlesDto } from '../dto/query-articles.dto';

@ApiTags('articles')
@Controller('articles')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({ description: 'List articles' })
  list(@Query() query: QueryArticlesDto) {
    return this.appService.findAll(query);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Article created' })
  create(@Body() dto: CreateArticleDto) {
    return this.appService.create(dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Get article by id' })
  get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Update article by id' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.appService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Delete article by id' })
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appService.remove(id);
  }
}


