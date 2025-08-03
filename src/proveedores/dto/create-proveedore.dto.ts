import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProveedorDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsString()
  contacto: string;
}
