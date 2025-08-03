import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateRecetaDto {
  @IsNotEmpty()
  @IsString()
  nombreReceta: string;

  @IsOptional()
  @IsString()
  tipoPlato?: string;

  @IsOptional()
  @IsNumber()
  tamanoPorcion?: number;

  @IsOptional()
  @IsNumber()
  numeroPorciones?: number;

  @IsOptional()
  @IsNumber()
  costoReceta?: number;

  @IsOptional()
  @IsString()
  procedimiento?: string;
}
