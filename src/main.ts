import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
