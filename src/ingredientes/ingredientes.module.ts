import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IngredientesService } from './ingredientes.service';
import { IngredientesController } from './ingredientes.controller';
import { Ingrediente } from './entities/ingrediente.entity'; // entidad correctamente importada

@Module({
  imports: [TypeOrmModule.forFeature([Ingrediente])], // aquí NestJS registra el repositorio
  controllers: [IngredientesController],
  providers: [IngredientesService],
})
export class IngredientesModule {}
