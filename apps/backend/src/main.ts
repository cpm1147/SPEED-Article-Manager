/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();
const isVercel = !!process.env.VERCEL;

async function bootstrap(): Promise<NestExpressApplication | void> {
  if (isVercel) {
    const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(server),
    );
    app.enableCors({ origin: true, credentials: true });
    await app.init(); 
    return app;
  } else {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors({ origin: true, credentials: true });
    const port = Number(process.env.PORT) || 3001;
    await app.listen(port);
    console.log(`Backend running at http://localhost:${port}`);
  }
}

bootstrap().catch(err => {
  console.error('NestJS bootstrap error', err);
});

export default server; 