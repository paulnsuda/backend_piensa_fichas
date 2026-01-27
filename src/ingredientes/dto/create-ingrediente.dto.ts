import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateIngredienteDto {
  @IsNotEmpty()
  @IsString()
  nombre_ingrediente: string;

  @IsNotEmpty()
  @IsString()
  unidad_medida: string;

  @IsOptional()
  @IsString()
  grupo?: string;

  @IsNotEmpty()
  @IsNumber()
  precioKg: number;

  // --- 🧪 CAMPOS DEL TEST DE RENDIMIENTO (NUEVOS) ---

  @IsOptional() // Opcional porque al crear quizás no tengas el dato exacto aún
  @IsNumber()
  peso_bruto?: number;

  @IsOptional()
  @IsNumber()
  peso_neto?: number;

  @IsOptional()
  @IsNumber()
  peso_desperdicio?: number;

  @IsOptional()
  @IsNumber()
  peso_subproducto?: number;

  // --- CAMPOS CALCULADOS O DE REFERENCIA ---

  @IsOptional()
  @IsNumber()
  peso_unitario?: number; 

  @IsOptional()
  @IsNumber()
  @Min(0) // Permitimos 0 si no hay rendimiento calculado
  @Max(100)
  rendimiento?: number; 

  @IsOptional()
  @IsNumber()
  precio_real?: number;

  // Mantenemos 'peso' opcional por si acaso algún proceso viejo lo envía, 
  // pero tu lógica nueva usará peso_bruto/pesoKg
  @IsOptional()
  @IsNumber()
  peso?: number;
}