// backend/src/ingredientes/dto/update-ingrediente.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateIngredienteDto {
  @IsOptional()
  @IsString()
  nombre_ingrediente?: string;

  @IsOptional()
  @IsString()
  unidad_medida?: string;

  @IsOptional()
  @IsNumber()
  precioKg?: number;

  @IsOptional()
  @IsNumber()
  peso?: number;

  @IsOptional()
  @IsNumber()
  pesoKg?: number;

  @IsOptional()
  @IsString()
  grupo?: string;

  @IsOptional()
  @IsNumber()
  id_compra?: number;
}
