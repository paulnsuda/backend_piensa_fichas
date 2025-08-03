import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedore.entity';
import { Ingrediente } from '../../ingredientes/entities/ingrediente.entity';
import { OneToMany } from 'typeorm/decorator/relations/OneToMany';
@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre_presentacion: string;

  @Column('decimal', { precision: 8, scale: 2 })
  precio_compra: number;

  @Column({ type: 'varchar', length: 10 })
  unidad_compra: string;

  @Column('decimal', { precision: 5, scale: 2 })
  rendimiento: number;

  @Column('decimal', { precision: 8, scale: 2 })
  factor_correccion: number;

  @Column('decimal', { precision: 8, scale: 2 })
  costo_final: number;

  @ManyToOne(() => Proveedor, { eager: true })
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

  @OneToMany(() => Ingrediente, (ingrediente) => ingrediente.compra)
ingredientes: Ingrediente[];

}
