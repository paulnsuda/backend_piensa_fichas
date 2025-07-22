import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS en desarrollo
  app.enableCors({
    origin: '*', // Puedes restringir por dominio en producción
  });

  await app.listen(3000);
}
bootstrap();
