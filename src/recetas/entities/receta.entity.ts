import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  ManyToOne, 
  JoinColumn, 
  DeleteDateColumn, 
  CreateDateColumn 
} from 'typeorm';
import { RecetaIngrediente } from '../../recetas_ingredientes/entities/receta_ingrediente.entity';
import { User } from '../../users/entities/user.entity';

@Entity('recetas')
export class Receta {
  @PrimaryGeneratedColumn()
  id: number;

  // 👇 Mapeo: Propiedad 'nombreReceta' <-> Columna BD 'nombre_receta'
  @Column({ name: 'nombre_receta', type: 'varchar', length: 200 })
  nombreReceta: string;

  @Column({ name: 'tipo_plato', nullable: true })
  tipoPlato: string;

  @Column({ name: 'num_porciones', type: 'int', nullable: true })
  numPorciones: number;

  @Column({ name: 'tamano_porcion', nullable: true })
  tamanoPorcion: string;

  @Column({ type: 'text', nullable: true })
  procedimiento: string;

  // Costo Total de Producción
  @Column({ name: 'costo_receta', type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoReceta: number;

  // 👇 NUEVO CAMPO 1: Rentabilidad Deseada (%)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 30 })
  rentabilidad: number;

  // 👇 NUEVO CAMPO 2: Precio de Venta Sugerido
  // Propiedad 'precioVenta' <-> Columna BD 'precio_venta'
  @Column({ name: 'precio_venta', type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioVenta: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // RELACIONES
  @OneToMany(() => RecetaIngrediente, (recetaIngrediente) => recetaIngrediente.receta, {
    cascade: true, // Vital para guardar los ingredientes junto con la receta
  })
  recetasIngredientes: RecetaIngrediente[];

  @ManyToOne(() => User, (user) => user.recetas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;
}