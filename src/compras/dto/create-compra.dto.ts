import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateCompraDto {
  @IsNotEmpty()
  @IsString()
  nombre_presentacion: string;

  // 👇 Hacemos opcional el precio unitario, ya que calculamos todo con el total
  @IsOptional()
  @IsNumber()
  precio_compra?: number;

  @IsOptional()
  @IsString()
  unidad_compra?: string;

  @IsNumber()
  peso_kg: number;

  @IsOptional()
  @IsNumber()
  rendimiento?: number;

  @IsOptional()
  @IsNumber()
  factor_correccion?: number;

  @IsNumber()
  costo_final: number;

  @IsNumber()
  id_proveedor: number;

  @IsNumber()
  id_ingrediente: number;

  // 👇 IMPORTANTE: Agregamos esto para que no rechace la fecha
  @IsOptional()
  @IsDateString() 
  fecha_compra?: string;
}