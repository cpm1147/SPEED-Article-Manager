/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  NotFoundException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article } from './schemas/article.schema';

@Controller('api/articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  async create(@Body() dto: CreateArticleDto): Promise<Article> {
    return await this.articleService.create(dto);
  }

  @Get()
  async find(@Query() query: any): Promise<Article[]> {
    return await this.articleService.find(query);
  }

  @Get('approved')
  async findApproved(): Promise<Article[]> {
    return await this.articleService.findApproved();
  }

  @Get('reviewed')
  async findReviewed(): Promise<Article[]> {
    return await this.articleService.findReviewed();
  }

  @Get('unmoderated')
  async findUnmoderated(): Promise<Article[]> {
    return await this.articleService.findUnmoderated();
  }

  @Get('rejected')
  async findRejected(): Promise<Article[]> {
    return await this.articleService.findRejected();
  }

  @Get('awaiting-analysis')
  async findAwaitingAnalysis(): Promise<Article[]> {
    return await this.articleService.findAwaitingAnalysis();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Article> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid article ID');
    }
    const article = await this.articleService.findById(id);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  @Put(':id/moderate')
  async moderate(@Param('id') id: string): Promise<Article> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid article ID');
    }
    const updated = await this.articleService.moderate(id);
    if (!updated) {
      throw new NotFoundException(`Cannot moderate: article ${id} not found`);
    }
    return updated;
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string): Promise<Article> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid article ID');
    }
    const updated = await this.articleService.reject(id);
    if (!updated) {
      throw new NotFoundException(`Cannot reject: article ${id} not found`);
    }
    return updated;
  }

  @Put(':id/analyse')
  async analyse(
    @Param('id') id: string,
    @Body() updated_fields: Partial<Article>,
  ): Promise<Article> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid article ID');
    }
    const updated = await this.articleService.analyse(id, updated_fields);
    if (!updated) {
      throw new NotFoundException(`Cannot analyse: article ${id} not found`);
    }
    return updated;
  }
}