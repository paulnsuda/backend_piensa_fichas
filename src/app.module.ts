import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { IngredientesModule } from './ingredientes/ingredientes.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '0980993908P',
      database: 'fichas_db',
      synchronize: true, // ⚠️ Solo en desarrollo
      autoLoadEntities: true,
    }),

    // Módulos propios del sistema
    AuthModule,
    IngredientesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Protege todas las rutas excepto las decoradas con @Public
    },
  ],
})
export class AppModule {}
