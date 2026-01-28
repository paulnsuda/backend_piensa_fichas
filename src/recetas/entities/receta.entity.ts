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

  @Column({ name: 'num_porciones', type: 'int', default: 1 })
  numPorciones: number;

  // ⚠️ MEJORA: Cambiado de string a decimal para cálculos matemáticos
  @Column({ name: 'tamano_porcion', type: 'decimal', precision: 10, scale: 2, default: 0 })
  tamanoPorcion: number; 

  @Column({ type: 'text', nullable: true })
  procedimiento: string;

  // Costo Total de Producción
  @Column({ name: 'costo_receta', type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoReceta: number;

  // Rentabilidad Deseada (%)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 30 })
  rentabilidad: number;

  // Precio de Venta Sugerido
  @Column({ name: 'precio_venta', type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioVenta: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // --- RELACIONES ---

  @OneToMany(() => RecetaIngrediente, (recetaIngrediente) => recetaIngrediente.receta, {
    cascade: true, 
  })
  recetasIngredientes: RecetaIngrediente[];

  // 👇 ESTO ES LO CRUCIAL PARA LA SEGURIDAD 👇
  @ManyToOne(() => User, (user) => user.recetas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' }) // Conecta con la columna SQL que creamos
  usuario: User;
}