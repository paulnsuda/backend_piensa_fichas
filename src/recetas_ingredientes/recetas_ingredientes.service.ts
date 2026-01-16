import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecetaIngrediente } from './entities/receta_ingrediente.entity'; 
import { CreateRecetaIngredienteDto } from './dto/create-receta_ingrediente.dto';
import { Receta } from '../recetas/entities/receta.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';

@Injectable()
export class RecetasIngredientesService {
  constructor(
    @InjectRepository(RecetaIngrediente)
    private readonly repo: Repository<RecetaIngrediente>,

    @InjectRepository(Receta)
    private readonly recetaRepo: Repository<Receta>,

    @InjectRepository(Ingrediente)
    private readonly ingredienteRepo: Repository<Ingrediente>,
  ) {}

  // 1. CREAR
  async create(dto: CreateRecetaIngredienteDto) {
    const ingrediente = await this.ingredienteRepo.findOneBy({ id: dto.id_ingrediente });
    if (!ingrediente) throw new NotFoundException('Ingrediente no encontrado');

    // Corrección: Usamos la relación directa, sin 'costo_ingrediente'
    const nuevaRelacion = this.repo.create({
      cantidad_usada: dto.cantidad_usada,
      receta: { id: dto.id_receta },
      ingrediente: { id: dto.id_ingrediente }
    });

    await this.repo.save(nuevaRelacion);
    await this.actualizarCostoTotal(dto.id_receta);
    return { mensaje: 'Ingrediente agregado correctamente' };
  }

  // 2. LISTAR
  findAll() {
    return this.repo.find({ relations: ['receta', 'ingrediente'] });
  }

  // 3. BUSCAR POR RECETA
  findByReceta(idReceta: number) {
    return this.repo.find({
      where: { 
        receta: { id: idReceta } // Corrección: Búsqueda por relación
      },
      relations: ['ingrediente'],
    });
  }

  // 4. ELIMINAR
  async remove(idReceta: number, idIngrediente: number) {
    const relacion = await this.repo.findOne({
      where: {
        receta: { id: idReceta },
        ingrediente: { id: idIngrediente }
      }
    });

    if (relacion) {
      await this.repo.remove(relacion);
      await this.actualizarCostoTotal(idReceta);
      return { mensaje: 'Ingrediente eliminado de la receta' };
    }
    throw new NotFoundException('Ingrediente no encontrado en esta receta');
  }

  // 5. ACTUALIZAR CANTIDAD
  async updateCantidad(idReceta: number, idIngrediente: number, nuevaCantidad: number) {
    const relacion = await this.repo.findOne({
      where: {
        receta: { id: idReceta },
        ingrediente: { id: idIngrediente }
      }
    });

    if (!relacion) throw new NotFoundException('Relación no encontrada');

    relacion.cantidad_usada = nuevaCantidad;
    // Ya no guardamos costo_ingrediente aquí

    await this.repo.save(relacion);
    await this.actualizarCostoTotal(idReceta);

    return { mensaje: 'Cantidad actualizada correctamente' };
  }

  // 6. ACTUALIZAR COSTO TOTAL (La corrección del snake_case)
  async actualizarCostoTotal(idReceta: number) {
    const ingredientesRelacion = await this.repo.find({
      where: { receta: { id: idReceta } },
      relations: ['ingrediente'] 
    });

    const nuevoCostoTotal = ingredientesRelacion.reduce((acc, item) => {
      const precio = Number(item.ingrediente.precioKg || 0);
      const cantidad = Number(item.cantidad_usada || 0);
      return acc + (cantidad * precio);
    }, 0);

    // Corrección: costoReceta (camelCase)
    await this.recetaRepo.update(idReceta, {
      costoReceta: Math.round(nuevoCostoTotal * 100) / 100 
    });
  }
}