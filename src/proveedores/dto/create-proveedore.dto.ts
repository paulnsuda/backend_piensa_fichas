import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional() // Puede ser opcional
  contacto?: string;

  // 👇 AGREGA ESTOS 3 CAMPOS NUEVOS
  @IsString()
  @IsOptional()
  rubro?: string;

  @IsString()
  @IsOptional()
  frecuencia?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  calificacion?: number;
}