import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedore.entity';
import { Ingrediente } from '../../ingredientes/entities/ingrediente.entity';
import { User } from '../../users/entities/user.entity'; // 👈 Importante importar User

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  peso_kg: number;

  @Column('decimal', { precision: 10, scale: 2 })
  costo_total: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha_compra: Date;

  // --- RELACIONES ---

  // 1. Proveedor (Muchas compras a un proveedor)
  @ManyToOne(() => Proveedor, (proveedor) => proveedor.compras, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'proveedorId' }) 
  proveedor: Proveedor;

  // 2. Ingrediente (Muchas compras de un ingrediente específico para stock)
  @ManyToOne(() => Ingrediente, (ingrediente) => ingrediente.compras, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'id_ingrediente' })
  ingrediente: Ingrediente;

  // 👇 ESTO ES LO QUE ARREGLA TU ERROR EN USER.ENTITY.TS 👇
  // Conecta la compra con el usuario que la registró
  @ManyToOne(() => User, (user) => user.compras, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' }) // Debe coincidir con la columna SQL
  usuario: User;
}