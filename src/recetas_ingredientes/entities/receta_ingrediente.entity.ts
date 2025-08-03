// src/recetas_ingredientes/entities/receta_ingrediente.entity.ts
import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Receta } from '../../recetas/entities/receta.entity';
import { Ingrediente } from '../../ingredientes/entities/ingrediente.entity';

@Entity('recetas_ingredientes')
export class RecetaIngrediente {
  @PrimaryColumn()
  id_receta: number;

  @PrimaryColumn()
  id_ingrediente: number;

  @ManyToOne(() => Receta, receta => receta.ingredientesRelacionados, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_receta' })
  receta: Receta;

  @ManyToOne(() => Ingrediente, ingrediente => ingrediente.recetasRelacionadas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_ingrediente' })
  ingrediente: Ingrediente;

  @Column('decimal', { precision: 10, scale: 4 })
  cantidad_usada: number;

  @Column('decimal', { precision: 10, scale: 4 })
  costo_ingrediente: number;
}
