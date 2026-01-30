import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ------------------------------------------------------------------
  // CORS OPTIMIZADO
  // ------------------------------------------------------------------
  const allowedOrigins = [
    'http://localhost:4200',
    'https://frontend-piensa-fichas.vercel.app',
    // Se recomienda agregar la URL de producción de Vercel completa si persiste el error
    'https://frontend-piensa-fichas-paulnsudas-projects.vercel.app'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite peticiones sin origen (como herramientas de servidor o Postman) 
      // y valida contra nuestra lista blanca.
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado por CORS: Origen no permitido'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // ------------------------------------------------------------------
  // VALIDACIONES GLOBALES
  // ------------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // Importante para que los IDs de las rutas se conviertan a números automáticamente
    }),
  );

  // Configuración de puerto para Railway
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en el puerto: ${port}`);
}
bootstrap();