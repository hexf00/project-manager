import { NestFactory } from '@nestjs/core';
import {AppModule} from './app/module'

export default async function () {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}