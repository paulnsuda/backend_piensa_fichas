import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCompraDto {
  @IsNotEmpty()
  @IsString()
  nombre_presentacion: string;

  @IsNumber()
  precio_compra: number;

  @IsString()
  unidad_compra: string;

  @IsNumber()
  rendimiento: number;

  @IsNumber()
  factor_correccion: number;

  @IsNumber()
  costo_final: number;

  @IsNumber()
  id_proveedor: number;
}

