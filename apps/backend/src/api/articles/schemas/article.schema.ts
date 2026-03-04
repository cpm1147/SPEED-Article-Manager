/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema()
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: [String] })
  authors: string[];

  @Prop()
  source: string;

  @Prop({ required: true })
  publication_year: number;

  @Prop({ required: true })
  doi: string;

  @Prop()
  abstract: string;

  @Prop()
  linked_discussion: string;

  @Prop()
  practice: string;

  @Prop()
  claim: string;

  @Prop()
  result: string;

  @Prop()
  participant_type: string;

  @Prop()
  method: string;

  @Prop({ default: false })
  isModerated: boolean;

  @Prop({ default: false })
  isRejected: boolean;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
