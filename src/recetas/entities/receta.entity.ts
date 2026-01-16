import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, DeleteDateColumn, CreateDateColumn } from 'typeorm';
import { RecetaIngrediente } from '../../recetas_ingredientes/entities/receta_ingrediente.entity';
import { User } from '../../users/entities/user.entity';

@Entity('recetas')
export class Receta {
  @PrimaryGeneratedColumn()
  id: number;

  // 👇 Fíjate: name='nombre_receta' (BD), pero la propiedad es nombreReceta (Código)
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

  @Column({ name: 'costo_receta', type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoReceta: number;

  @CreateDateColumn()
  fecha_creacion: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // RELACIONES
  @OneToMany(() => RecetaIngrediente, (recetaIngrediente) => recetaIngrediente.receta, {
    cascade: true, // Esto permite guardar ingredientes automáticamente
  })
  recetasIngredientes: RecetaIngrediente[];

  @ManyToOne(() => User, (user) => user.recetas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;
}