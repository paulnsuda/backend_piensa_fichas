// src/recetas_ingredientes/dto/create-receta-ingrediente.dto.ts
import { IsNumber } from 'class-validator';

export class CreateRecetaIngredienteDto {
  @IsNumber()
  id_receta: number;

  @IsNumber()
  id_ingrediente: number;

  @IsNumber()
  cantidad_usada: number;
}