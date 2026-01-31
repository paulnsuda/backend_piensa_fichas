import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ------------------------------------------------------------------
  // CORS DINÁMICO Y ROBUSTO
  // ------------------------------------------------------------------
  const allowedOrigins = [
    'http://localhost:4200',
    'https://frontend-piensa-fichas.vercel.app',
    'https://frontend-piensa-fichas-paulnsudas-projects.vercel.app'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // 1. Permitir si no hay origen (Postman/Server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // 2. Limpiar el origen de posibles barras finales para evitar errores de coincidencia
      const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

      // 3. Verificar si está en la lista o si es un subdominio de vercel.app
      const isAllowed = allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith('.vercel.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        // Log para ver en Railway exactamente qué dominio está fallando
        console.error(`CORS Bloqueado para el origen: ${origin}`);
        callback(new Error('Bloqueado por CORS: Origen no permitido'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  // ------------------------------------------------------------------
  // VALIDACIONES GLOBALES
  // ------------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Servidor listo en puerto ${port}`);
}
bootstrap();