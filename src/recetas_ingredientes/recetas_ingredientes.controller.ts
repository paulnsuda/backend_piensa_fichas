// src/recetas_ingredientes/recetas_ingredientes.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { RecetasIngredientesService } from './recetas_ingredientes.service';

import { CreateRecetaIngredienteDto } from './dto/create-receta_ingrediente.dto';

@Controller('recetas-ingredientes')
export class RecetaIngredienteController {
 constructor(private readonly service: RecetasIngredientesService) {}


  @Post()
  create(@Body() dto: CreateRecetaIngredienteDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('receta/:id')
  findByReceta(@Param('id') id: number) {
    return this.service.findByReceta(+id);
  }

  @Delete(':id_receta/:id_ingrediente')
  remove(
    @Param('id_receta') id_receta: number,
    @Param('id_ingrediente') id_ingrediente: number,
  ) {
    return this.service.remove(+id_receta, +id_ingrediente);
  }

  

  @Patch('actualizar-cantidad')
  updateCantidad(
    @Query('id_receta') idReceta: number,
    @Query('id_ingrediente') idIngrediente: number,
    @Query('nueva') nuevaCantidad: number,
  ) {
    return this.service.updateCantidad(+idReceta, +idIngrediente, +nuevaCantidad);
  }
}
