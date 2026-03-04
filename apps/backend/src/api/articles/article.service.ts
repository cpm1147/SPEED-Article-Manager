/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  async create(dto: CreateArticleDto): Promise<Article> {
    return await this.articleModel.create(dto);
  }

  async find(query: any): Promise<Article[]> {
    if (query.all === 'true' || Object.keys(query).length === 0) {
      return await this.findApproved();
    }
    //moderation/analysis handling

    if (query.isModerated == 'false') {
      return await this.findUnmoderated();
    }

    if (query.isRejected == 'true') {
      return await this.findRejected();
    }

    if (query.isApproved == 'false') {
      return await this.findAwaitingAnalysis();
    }

    //general handling
    const filter: any = {
      isModerated: true,
      isRejected: false,
      isApproved: true,
    };

    if (query.title) {
      filter.title = { $regex: query.title, $options: 'i' };
    }

    if (query['authors[]']) {
      const authorsArray = Array.isArray(query['authors[]'])
        ? query['authors[]']
        : [query['authors[]']];
      if (authorsArray.length > 0) {
        filter.authors = { $in: authorsArray };
      }
    }

    if (query.publication_year_start || query.publication_year_end) {
      filter.publication_year = {};
      if (query.publication_year_start) {
        filter.publication_year.$gte = Number(query.publication_year_start);
      }
      if (query.publication_year_end) {
        filter.publication_year.$lte = Number(query.publication_year_end);
      }
    }

    if (query.doi) {
      filter.doi = query.doi;
    }

    if (query.practice) {
      filter.practice = { $regex: query.practice, $options: 'i' };
    }

    if (query.claim) {
      filter.claim = { $regex: query.claim, $options: 'i' };
    }

    if (typeof query.isModerated !== 'undefined') {
      filter.isModerated = query.isModerated === 'true';
    }

    if (typeof query.isRejected !== 'undefined') {
      filter.isRejected = query.isRejected === 'true';
    }

    return await this.articleModel.find(filter).exec();
  }

  async findAll(): Promise<Article[]> {
    return await this.articleModel.find().exec();
  }

  async findApproved(): Promise<Article[]> {
    return await this.articleModel.find({ isApproved: true }).exec();
  }

  async findReviewed(): Promise<Article[]> {
    return await this.articleModel
      .find({ isModerated: true, isRejected: false })
      .exec();
  }

  async findUnmoderated(): Promise<Article[]> {
    return await this.articleModel
      .find({ isModerated: false, isRejected: false })
      .exec();
  }

  async findRejected(): Promise<Article[]> {
    return await this.articleModel.find({ isRejected: true }).exec();
  }

  //analysis comes after moderation but before approval
  async findAwaitingAnalysis(): Promise<Article[]> {
    return await this.articleModel.find({ isModerated: true, isRejected: false, isApproved: false}).exec();
  }

  async findById(id: string): Promise<Article | null> {
    return await this.articleModel.findById(id).exec();
  }

  async moderate(id: string): Promise<Article | null> {
    return await this.articleModel.findByIdAndUpdate(
      id,
      { isModerated: true, isRejected: false },
      { new: true },
    );
  }

  async reject(id: string): Promise<Article | null> {
    return await this.articleModel.findByIdAndUpdate(
      id,
      { isModerated: false, isRejected: true },
      { new: true },
    );
  }

  async analyse(id: string, updated_fields: Partial<Article>): Promise<Article | null> {
    const updated = await this.articleModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updated_fields,
        },
        isApproved: true,
      },
      { new: true },
    );
  
    return updated;
  }
}
