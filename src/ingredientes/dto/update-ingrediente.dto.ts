// src/ingredientes/dto/update-ingrediente.dto.ts
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateIngredienteDto {
  @IsOptional() @IsString() nombre_ingrediente?: string;
  @IsOptional() @IsString() unidad_medida?: string;
  
  @IsOptional() @IsNumber() peso?: number;          // ✅ Debe estar aquí
  @IsOptional() @IsNumber() peso_unitario?: number; // ✅ Debe estar aquí
  @IsOptional() @IsNumber() precioKg?: number;
  
  @IsOptional() @IsNumber() @Min(1) @Max(100) rendimiento?: number;
  @IsOptional() @IsString() grupo?: string;
}