// src/ingredientes/entities/ingrediente.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  DeleteDateColumn, 
  BeforeInsert, 
  BeforeUpdate 
} from 'typeorm';
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

  // 👇 FALTABA ESTE: La cantidad que ingresa el usuario (Ej: 5 Libras)
  @Column('decimal', { precision: 10, scale: 4 })
  peso: number;

  // 👇 FALTABA ESTE: El cálculo estandarizado (Ej: 2.26 Kg)
  @Column('decimal', { precision: 10, scale: 4 })
  pesoKg: number;

  // Factor de conversión para unidades (Ej: 1 Unidad = 1.5 Kg)
  @Column('decimal', { precision: 10, scale: 4, default: 1 })
  peso_unitario: number; 

  @Column('decimal', { precision: 10, scale: 2 })
  precioKg: number; // Precio de Mercado

  @Column('decimal', { precision: 5, scale: 2, default: 100 })
  rendimiento: number; // Merma %

  @Column('decimal', { precision: 10, scale: 2 })
  precio_real: number; // Costo Real (Calculado)

  @Column({ type: 'varchar', length: 100, nullable: true })
  grupo: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Compra, (compra) => compra.ingrediente)
  compras: Compra[];

  @OneToMany(() => RecetaIngrediente, (recetaIngrediente) => recetaIngrediente.ingrediente)
  recetasIngredientes: RecetaIngrediente[];

  @BeforeInsert()
  @BeforeUpdate()
  calcularPrecioReal() {
    const porcentaje = (this.rendimiento && this.rendimiento > 0) ? this.rendimiento : 100;
    const factor = porcentaje / 100;
    this.precio_real = this.precioKg / factor;
  }
}