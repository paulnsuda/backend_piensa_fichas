import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateIngredienteDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNumber()
  @Min(0.01)
  precio: number;

  @IsNotEmpty()
  @IsString()
  unidad: string;
}
