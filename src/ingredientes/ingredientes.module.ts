import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from 'src/compras/entities/compra.entity'; // Asegúrate de que la ruta sea correcta
import { IngredientesService } from './ingredientes.service';
import { IngredientesController } from './ingredientes.controller';
import { Ingrediente } from './entities/ingrediente.entity'; // entidad correctamente importada

@Module({
  imports: [TypeOrmModule.forFeature([Ingrediente, Compra])],
  controllers: [IngredientesController],
  providers: [IngredientesService],
})
export class IngredientesModule {}
