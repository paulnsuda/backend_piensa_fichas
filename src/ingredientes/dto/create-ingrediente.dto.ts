// src/ingredientes/dto/create-ingrediente.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateIngredienteDto {
  @IsNotEmpty()
  @IsString()
  nombre_ingrediente: string;

  @IsNotEmpty()
  @IsString()
  unidad_medida: string;

  // 👇 FALTABA ESTE: Cantidad comprada
  @IsNotEmpty()
  @IsNumber()
  peso: number;

  @IsOptional()
  @IsNumber()
  peso_unitario?: number; 

  @IsNotEmpty()
  @IsNumber()
  precioKg: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  rendimiento?: number; 
  
  @IsOptional()
  @IsString()
  grupo?: string;
}