import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RecetaIngrediente } from '../../recetas_ingredientes/entities/receta_ingrediente.entity';

@Entity('recetas')
export class Receta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre_receta', type: 'varchar', length: 200 })
  nombreReceta: string;

  @Column({ name: 'tipo_plato', type: 'varchar', length: 50, nullable: true })
  tipoPlato: string;

  @Column({ name: 'tamano_porcion', type: 'decimal', precision: 8, scale: 2, nullable: true })
  tamanoPorcion: number;

  @Column({ name: 'numero_porciones', type: 'int', nullable: true })
  numeroPorciones: number;

  @Column({ name: 'costo_receta', type: 'decimal', precision: 8, scale: 2, nullable: true })
  costoReceta: number;

  @Column({ type: 'text', nullable: true })
  procedimiento: string;

  @OneToMany(() => RecetaIngrediente, ri => ri.receta, { eager: true })
  ingredientesRelacionados: RecetaIngrediente[];
}
