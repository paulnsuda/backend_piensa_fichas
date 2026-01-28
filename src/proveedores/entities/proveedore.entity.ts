import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  ManyToOne,   // 👈 Necesario para la relación
  JoinColumn   // 👈 Necesario para unir con la columna SQL
} from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity';
import { User } from '../../users/entities/user.entity'; // 👈 Asegúrate de importar User

@Entity('proveedores') // Es buena práctica poner el nombre de la tabla
export class Proveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  contacto: string;

  @Column({ nullable: true })
  rubro: string;

  @Column({ nullable: true })
  frecuencia: string;

  @Column({ default: 5 }) 
  calificacion: number;

  // --- RELACIONES ---

  @OneToMany(() => Compra, (compra) => compra.proveedor)
  compras: Compra[];

  // 👇 ESTO ES LO NUEVO (MULTI-TENENCIA) 👇
  // Conecta este proveedor con un usuario específico
  @ManyToOne(() => User, (user) => user.proveedores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' }) // Debe coincidir con la columna que creaste en pgAdmin
  usuario: User;
}