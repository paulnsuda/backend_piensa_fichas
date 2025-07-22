import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Rol } from '../../users/enums/rol.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Rol)
  rol: Rol;
}
