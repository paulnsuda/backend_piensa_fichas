import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, DeleteDateColumn } from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity';
import { RecetaIngrediente } from '../../recetas_ingredientes/entities/receta_ingrediente.entity'; // 👈 Asegúrate de que este import exista

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

  // 👇 Esta es la columna para Soft Delete (Paso 3)
  @DeleteDateColumn()
  deletedAt: Date;

  // RELACIONES --------------------------

  // Relación con Compras
  @OneToMany(() => Compra, (compra) => compra.ingrediente)
  compras: Compra[];

  // 👇 ESTA ES LA LÍNEA QUE TE FALTA Y CAUSA EL ERROR
  @OneToMany(() => RecetaIngrediente, (ri) => ri.ingrediente)
  recetasRelacionadas: RecetaIngrediente[];
}