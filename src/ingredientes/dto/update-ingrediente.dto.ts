import { PartialType } from '@nestjs/mapped-types'; // Si usas PartialType es más limpio, pero lo haré manual como lo tenías
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { CreateIngredienteDto } from './create-ingrediente.dto';

// Opción recomendada: Extender del Create para heredar todo automáticamente
// export class UpdateIngredienteDto extends PartialType(CreateIngredienteDto) {}

// Opción Manual (la que tenías):
export class UpdateIngredienteDto {
  @IsOptional() @IsString() nombre_ingrediente?: string;
  @IsOptional() @IsString() unidad_medida?: string;
  @IsOptional() @IsString() grupo?: string;
  @IsOptional() @IsNumber() precioKg?: number;

  // --- 🧪 CAMPOS DEL TEST DE RENDIMIENTO ---
  @IsOptional() @IsNumber() peso_bruto?: number;
  @IsOptional() @IsNumber() peso_neto?: number;
  @IsOptional() @IsNumber() peso_desperdicio?: number;
  @IsOptional() @IsNumber() peso_subproducto?: number;

  // --- OTROS ---
  @IsOptional() @IsNumber() peso_unitario?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) rendimiento?: number;

  @IsOptional() @IsNumber() precio_real?: number;
  
  @IsOptional() @IsNumber() peso?: number;
}