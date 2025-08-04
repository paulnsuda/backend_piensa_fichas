import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ------------------------------------------------------------------
  // CORS
  // ------------------------------------------------------------------
  // • En desarrollo (`npm run start:dev`) se permite cualquier origen.
  // • En producción (Render, Fly, etc.) se restringe a tu dominio de Vercel.
  //   Ajusta los dominios que necesites en el array `allowedOrigins`.
  // ------------------------------------------------------------------

  const allowedOrigins = [
    'http://localhost:4200',                     // Angular local
    'https://frontend-piensa-fichas.vercel.app'  // Dominio en Vercel
  ];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });

  // Escucha en el puerto 3000 (o el que definas en tu .env / plataforma)
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
