import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity'; // Asegura la ruta correcta

@Entity()
export class Proveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  contacto: string;

  // 👇 AGREGA ESTAS 3 COLUMNAS NUEVAS
  @Column({ nullable: true })
  rubro: string;

  @Column({ nullable: true })
  frecuencia: string;

  @Column({ default: 5 }) // Por defecto 5 estrellas
  calificacion: number;

  @OneToMany(() => Compra, (compra) => compra.proveedor)
  compras: Compra[];
}