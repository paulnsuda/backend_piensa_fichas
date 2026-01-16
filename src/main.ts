import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ------------------------------------------------------------------
  // CORS
  // ------------------------------------------------------------------
  const allowedOrigins = [
    'http://localhost:4200',                     // Angular local
    'https://frontend-piensa-fichas.vercel.app'  // Dominio en Vercel
  ];

  app.enableCors({
    // Usamos siempre la lista explícita para evitar conflictos con 'credentials: true'
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ------------------------------------------------------------------
  // VALIDACIONES GLOBALES (Necesario para que @IsEmail funcione)
  // ------------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Escucha en el puerto 3000
  await app.listen(process.env.PORT || 3000);
}
bootstrap();