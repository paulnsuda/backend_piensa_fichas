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

  // --- 1. DATOS DEL TEST DE RENDIMIENTO (MERMA) ---
  @Column('decimal', { precision: 10, scale: 4, default: 1 })
  peso_bruto: number; // Peso inicial del test

  @Column('decimal', { precision: 10, scale: 4, default: 1 })
  peso_neto: number;  // Peso útil tras limpieza

  @Column('decimal', { precision: 10, scale: 4, default: 0 })
  peso_desperdicio: number;

  @Column('decimal', { precision: 10, scale: 4, default: 0 })
  peso_subproducto: number;

  // --- 2. DATOS DE INVENTARIO (STOCK) ---
  // 👇 RESTAURADO: Este es el campo que 'compras' y 'app.service' buscaban
  @Column('decimal', { precision: 10, scale: 4, default: 0 })
  pesoKg: number; // Stock actual disponible en almacén (Estandarizado a KG/L)

  // --- 3. COSTOS Y FACTORES ---
  @Column('decimal', { precision: 10, scale: 4, default: 1 })
  peso_unitario: number; // Factor de corrección (Bruto / Neto)

  @Column('decimal', { precision: 10, scale: 2 })
  precioKg: number; // Precio de Mercado (Bruto)

  @Column('decimal', { precision: 5, scale: 2, default: 100 })
  rendimiento: number; // %

  @Column('decimal', { precision: 10, scale: 2 })
  precio_real: number; // Costo Real (Limpio)

  @Column({ type: 'varchar', length: 100, nullable: true })
  grupo: string;

  @Column({ type: 'boolean', default: false })
  es_preparacion: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Compra, (compra) => compra.ingrediente)
  compras: Compra[];

  @OneToMany(() => RecetaIngrediente, (recetaIngrediente) => recetaIngrediente.ingrediente)
  recetasIngredientes: RecetaIngrediente[];

  // --- CÁLCULOS AUTOMÁTICOS ---
  @BeforeInsert()
  @BeforeUpdate()
  calcularValores() {
    const bruto = Number(this.peso_bruto) || 1;
    const neto = Number(this.peso_neto) || 1;
    const precioCompra = Number(this.precioKg) || 0;

    // Rendimiento
    if (bruto > 0) {
      this.rendimiento = (neto / bruto) * 100;
    } else {
      this.rendimiento = 100;
    }

    // Factor Corrección
    if (neto > 0) {
      this.peso_unitario = bruto / neto;
    } else {
      this.peso_unitario = 1;
    }

    // Precio Real
    this.precio_real = precioCompra * this.peso_unitario;

    // Asegurar que pesoKg (Stock) tenga valor numérico por defecto si es nuevo
    if (this.pesoKg === undefined || this.pesoKg === null) {
      this.pesoKg = 0;
    }
  }
}