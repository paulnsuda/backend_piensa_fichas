import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
// Usamos "import type" para romper el ciclo de dependencias (Solución a la línea roja)
import { Receta } from '../../recetas/entities/receta.entity'; 
import { Ingrediente } from '../../ingredientes/entities/ingrediente.entity';

@Entity('recetas_ingredientes')
export class RecetaIngrediente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 3 }) // Agregamos decimales por si usas 0.5 kg
  cantidad_usada: number;

  // 👇 ELIMINAMOS las columnas explícitas 'id_receta' e 'id_ingrediente'
  // porque ya están incluidas dentro de las relaciones de abajo.

  // Relaciones
  @ManyToOne('Receta', (receta: Receta) => receta.recetasIngredientes, {
    onDelete: 'CASCADE', // Si borras la receta, se borran sus ingredientes
  })
  @JoinColumn({ name: 'id_receta' }) // Aquí se crea la columna física 'id_receta'
  receta: Receta;

  @ManyToOne(() => Ingrediente)
  @JoinColumn({ name: 'id_ingrediente' }) // Aquí se crea la columna física 'id_ingrediente'
  ingrediente: Ingrediente;
}