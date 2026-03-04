/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { INestApplication } from '@nestjs/common';
import * as express from 'express';

const server = express();
const isVercel = !!process.env.VERCEL;

async function bootstrap(): Promise<void> {
  try {
    let app: INestApplication;

    if (isVercel) {
      const adapter = new ExpressAdapter(server);
      app = await NestFactory.create(AppModule, adapter);
      app.enableCors({ origin: true, credentials: true });
      await app.init(); 
    } else {
      app = await NestFactory.create(AppModule);
      app.enableCors({ origin: true, credentials: true });
      const port = Number(process.env.PORT) || 3001;
      await app.listen(port);
      console.log(`🚀 Backend running at http://localhost:${port}`);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('NestJS bootstrap error:', err.message);
    } else {
      console.error('Unknown bootstrap error:', err);
    }
  }
}

bootstrap();

export default server;