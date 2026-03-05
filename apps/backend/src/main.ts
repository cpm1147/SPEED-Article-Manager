/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
const isVercel = process.env.VERCEL === '1';

async function bootstrap() {
  if (isVercel) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors({ origin: true, credentials: true });
    await app.init();
  } else {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true, credentials: true });

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`Backend running at http://localhost:${port}`);
  }
}

bootstrap();

export default server;