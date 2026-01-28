import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rol } from '../enums/rol.enum';
import { Receta } from '../../recetas/entities/receta.entity';
import { Ingrediente } from '../../ingredientes/entities/ingrediente.entity'; // 👈 Importante
import { Compra } from '../../compras/entities/compra.entity'; // 👈 Recomendado
import { Proveedor } from '../../proveedores/entities/proveedore.entity'; // 👈 Recomendado

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

  // --- RELACIONES (LO QUE EL USUARIO HA CREADO) ---

  // 1. Recetas
  @OneToMany(() => Receta, (receta) => receta.usuario)
  recetas: Receta[];

  // 2. Ingredientes (ESTO ES LO QUE ARREGLA TU ERROR ACTUAL) 👇
  @OneToMany(() => Ingrediente, (ingrediente) => ingrediente.usuario)
  ingredientes: Ingrediente[];

  // 3. Compras (Para que cada alumno vea solo su historial de compras)
  @OneToMany(() => Compra, (compra) => compra.usuario)
  compras: Compra[];

  // 4. Proveedores (Para que cada alumno gestione sus propios proveedores)
  @OneToMany(() => Proveedor, (proveedor) => proveedor.usuario)
  proveedores: Proveedor[];
}