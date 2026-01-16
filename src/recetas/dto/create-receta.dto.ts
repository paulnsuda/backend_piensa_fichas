import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 1. Definimos la estructura del ID del ingrediente
class IngredienteRelation {
  @IsNumber()
  id: number;
}

// 2. Definimos el item de la lista (Cantidad + Ingrediente)
export class CreateRecetaIngredienteItemDto {
  @IsNumber()
  cantidad_usada: number;

  @ValidateNested()
  @Type(() => IngredienteRelation)
  ingrediente: IngredienteRelation;
}

// 3. El DTO Principal de la Receta
export class CreateRecetaDto {
  @IsNotEmpty()
  @IsString()
  nombre_receta: string;

  @IsOptional()
  @IsString()
  tipo_plato?: string;

  @IsOptional()
  @IsNumber()
  num_porciones?: number;

  @IsOptional()
  @IsString()
  tamano_porcion?: string;

  @IsOptional()
  @IsString()
  procedimiento?: string;

  @IsOptional()
  @IsNumber()
  costo_receta?: number;

  // 👇 Aquí aceptamos el Array con la estructura nueva
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecetaIngredienteItemDto)
  recetasIngredientes?: CreateRecetaIngredienteItemDto[];
}