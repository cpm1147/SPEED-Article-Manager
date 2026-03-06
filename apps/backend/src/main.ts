/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

const server = express();

async function createNestServer(expressInstance = server) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));
  app.enableCors({ origin: true, credentials: true });
  await app.init();
  return app;
}

if (process.env.VERCEL === '1') {
  createNestServer();
} else {
  (async () => {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true, credentials: true });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Local backend running at http://localhost:${port}`);
  })();
}

server.all('*', async (req: Request, res: Response) => {
  try {
    await createNestServer(server);
  } catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown error';

  res.status(500).json({
    message: 'Internal server error',
    error: message,
  });
}
});

export default server;