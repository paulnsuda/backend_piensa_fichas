import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedore.entity';
import { Ingrediente } from '../../ingredientes/entities/ingrediente.entity';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre_presentacion: string; // Ej: "Saco de harina 50kg"

  @Column('decimal', { precision: 10, scale: 2 })
  precio_compra: number; // Precio que pagaste

  @Column({ type: 'varchar', length: 10 })
  unidad_compra: string; // Ej: "kg", "lb", "bulto"

  // 👇 IMPORTANTE: Necesario para sumar al stock del inventario
  @Column('decimal', { precision: 10, scale: 4 })
  peso_kg: number; 

  @Column('decimal', { precision: 5, scale: 2, default: 100 })
  rendimiento: number;

  @Column('decimal', { precision: 8, scale: 2, default: 1 })
  factor_correccion: number;

  @Column('decimal', { precision: 10, scale: 2 })
  costo_final: number; // Costo real tras aplicar mermas (si aplica) o costo total

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha_compra: string;

  // RELACIONES --------------------------

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.compras, { eager: true })
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

  // Corrección: Una Compra apunta a UN Ingrediente (para rellenar su stock)
  @ManyToOne(() => Ingrediente, { nullable: false }) 
  @JoinColumn({ name: 'id_ingrediente' })
  ingrediente: Ingrediente;
}