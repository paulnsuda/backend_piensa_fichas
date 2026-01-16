import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rol } from '../enums/rol.enum';
import { Receta } from '../../recetas/entities/receta.entity'; 

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Rol,
    default: Rol.ALUMNO,
  })
  rol: Rol;

  // 👇 Relación: Un usuario tiene muchas recetas
  @OneToMany(() => Receta, (receta) => receta.usuario)
  recetas: Receta[];
}