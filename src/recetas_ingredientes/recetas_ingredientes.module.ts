import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetaIngrediente } from './entities/receta_ingrediente.entity';
import { RecetaIngredienteService } from './recetas_ingredientes.service';
import { RecetaIngredienteController } from './recetas_ingredientes.controller';

import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';
import { Receta } from '../recetas/entities/receta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecetaIngrediente, Ingrediente, Receta]) // <-- Asegúrate de que Ingrediente esté aquí
  ],
  controllers: [RecetaIngredienteController],
  providers: [RecetaIngredienteService],
})
export class RecetasIngredientesModule {}
