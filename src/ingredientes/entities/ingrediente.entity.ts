import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  DeleteDateColumn, 
  BeforeInsert, 
  BeforeUpdate,
  ManyToOne,   // 👈 Importante
  JoinColumn   // 👈 Importante
} from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity';
import { RecetaIngrediente } from '../../recetas_ingredientes/entities/receta_ingrediente.entity';
import { User } from '../../users/entities/user.entity'; // 👈 Asegúrate que la ruta sea correcta

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
  peso_bruto: number;

  @Column('decimal', { precision: 10, scale: 4, default: 1 })
  peso_neto: number;

  @Column('decimal', { precision: 10, scale: 4, default: 0 })
  peso_desperdicio: number;

  @Column('decimal', { precision: 10, scale: 4, default: 0 })
  peso_subproducto: number;

  // --- 2. DATOS DE INVENTARIO (STOCK) ---
  @Column('decimal', { precision: 10, scale: 4, default: 0 })
  pesoKg: number; 

  // --- 3. COSTOS Y FACTORES ---
  @Column('decimal', { precision: 10, scale: 4, default: 1 })
  peso_unitario: number; // Factor de corrección

  @Column('decimal', { precision: 10, scale: 2 })
  precioKg: number; // Precio de Mercado

  @Column('decimal', { precision: 5, scale: 2, default: 100 })
  rendimiento: number; // %

  @Column('decimal', { precision: 10, scale: 2 })
  precio_real: number; // Costo Real

  @Column({ type: 'varchar', length: 100, nullable: true })
  grupo: string;

  @Column({ type: 'boolean', default: false })
  es_preparacion: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  // --- RELACIONES ---

  @OneToMany(() => Compra, (compra) => compra.ingrediente)
  compras: Compra[];

  @OneToMany(() => RecetaIngrediente, (recetaIngrediente) => recetaIngrediente.ingrediente)
  recetasIngredientes: RecetaIngrediente[];

  // 👇 ESTO ES LO NUEVO (MULTI-TENENCIA) 👇
  // Conecta el ingrediente con la tabla 'user' usando la columna 'usuario_id' que creamos en SQL
  @ManyToOne(() => User, (user) => user.ingredientes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

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

    // Asegurar stock inicial
    if (this.pesoKg === undefined || this.pesoKg === null) {
      this.pesoKg = 0;
    }
  }
}