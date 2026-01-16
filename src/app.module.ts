import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

// Módulos
import { AuthModule } from './auth/auth.module';
import { IngredientesModule } from './ingredientes/ingredientes.module';
import { ComprasModule } from './compras/compras.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { RecetasModule } from './recetas/recetas.module';
import { RecetasIngredientesModule } from './recetas_ingredientes/recetas_ingredientes.module';

// Entidades necesarias para el Dashboard
import { Receta } from './recetas/entities/receta.entity';
import { Ingrediente } from './ingredientes/entities/ingrediente.entity';
import { Compra } from './compras/entities/compra.entity';

// Controladores y Servicios Base
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true, 
    }),
    // 👇 IMPORTANTE: Esto permite usar los repositorios en AppService
    TypeOrmModule.forFeature([Receta, Ingrediente, Compra]), 

    AuthModule,
    IngredientesModule,
    ComprasModule,
    ProveedoresModule,
    RecetasModule,
    RecetasIngredientesModule,
  ],
  controllers: [AppController], // 👈 Asegúrate de que esté aquí
  providers: [
    AppService, // 👈 Asegúrate de que esté aquí
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}