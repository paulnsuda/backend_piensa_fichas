// backend/src/ingredientes/dto/create-ingrediente.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateIngredienteDto {
  @IsNotEmpty()
  @IsString()
  nombre_ingrediente: string;

  @IsNotEmpty()
  @IsString()
  unidad_medida: string;

  @IsNotEmpty()
  @IsNumber()
  precioKg: number;

  @IsNotEmpty()
  @IsNumber()
  peso: number;

  @IsOptional()
  @IsNumber()
  pesoKg?: number;

  @IsNotEmpty()
  @IsString()
  grupo: string;

  @IsOptional()
  @IsNumber()
  id_compra?: number;
}
