import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { IngredientesModule } from './ingredientes/ingredientes.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ComprasModule } from './compras/compras.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { RecetasModule } from './recetas/recetas.module';
import { RecetasIngredientesModule } from './recetas_ingredientes/recetas_ingredientes.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: true, // ❗Solo para desarrollo
      autoLoadEntities: true,
    }),
    AuthModule,
    IngredientesModule,
    ComprasModule,
    ProveedoresModule,
    RecetasModule,
    RecetasIngredientesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Protege todas las rutas privadas
    },
  ],
})
export class AppModule {}
