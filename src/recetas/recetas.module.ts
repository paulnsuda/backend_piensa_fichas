import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetasService } from './recetas.service';
import { RecetasController } from './recetas.controller';
import { Receta } from './entities/receta.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity'; // 👈 IMPORTANTE

@Module({
  imports: [
    TypeOrmModule.forFeature([Receta, Ingrediente]), // 👈 AGREGAR AQUÍ
  ],
  controllers: [RecetasController],
  providers: [RecetasService],
  exports: [RecetasService] 
})
export class RecetasModule {}