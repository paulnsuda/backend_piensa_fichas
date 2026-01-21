import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Receta } from '../../recetas/entities/receta.entity';
import { Ingrediente } from '../../ingredientes/entities/ingrediente.entity';


@Entity('recetas_ingredientes')
export class RecetaIngrediente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 4 }) // Scale 4 para mayor precisión en costos
  cantidad_usada: number;

  // 👇 AGREGAMOS ESTA COLUMNA NUEVA
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) 
  costo_historico: number;

  @ManyToOne(() => Receta, (receta) => receta.recetasIngredientes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_receta' })
  receta: Receta;

  @ManyToOne(() => Ingrediente, (ingrediente) => ingrediente.recetasIngredientes)
  @JoinColumn({ name: 'id_ingrediente' })
  ingrediente: Ingrediente;
}