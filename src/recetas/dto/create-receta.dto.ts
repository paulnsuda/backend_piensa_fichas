import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 1. Definimos la estructura del ID del ingrediente
class IngredienteRelation {
  @IsNumber()
  id: number;
}

// 2. Definimos el item de la lista (Cantidad + Ingrediente + Costo Histórico)
export class CreateRecetaIngredienteItemDto {
  @IsNumber()
  cantidad_usada: number;

  // Permite recibir el precio "congelado" (Costo Real) desde el Frontend
  @IsOptional() 
  @IsNumber()
  costo_historico?: number;

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

  // 👇 NUEVOS CAMPOS (Coinciden con el JSON del Frontend)
  @IsOptional()
  @IsNumber()
  rentabilidad?: number;

  @IsOptional()
  @IsNumber()
  precio_venta?: number;

  // Lista de ingredientes
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecetaIngredienteItemDto)
  recetasIngredientes?: CreateRecetaIngredienteItemDto[];
}