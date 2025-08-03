import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity';
import { RecetaIngrediente } from '../../recetas_ingredientes/entities/receta_ingrediente.entity';

@Entity('ingredientes')
export class Ingrediente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre_ingrediente: string;

  @Column({ type: 'varchar', length: 50 })
  unidad_medida: string;

  @Column('decimal', { precision: 10, scale: 4 })
  peso: number;

  @Column('decimal', { precision: 10, scale: 4 })
  pesoKg: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioKg: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  grupo: string;

  @ManyToOne(() => Compra, compra => compra.ingredientes, { eager: true, nullable: true })
  compra: Compra;

  @OneToMany(() => RecetaIngrediente, ri => ri.ingrediente)
  recetasRelacionadas: RecetaIngrediente[];
}
