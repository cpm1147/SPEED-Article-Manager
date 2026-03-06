/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

async function createNestServer(expressInstance = server) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));
  app.enableCors({ origin: true, credentials: true });
  await app.init();
}

if (process.env.VERCEL) {
  createNestServer(server);
} else {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true, credentials: true });
    await app.listen(process.env.PORT || 3001);
    console.log('Local backend running');
  }
  bootstrap();
}

export default server;