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

  async create(dto: CreateRecetaIngredienteDto) {
    const ingrediente = await this.ingredienteRepo.findOneBy({ id: dto.id_ingrediente });
    if (!ingrediente) throw new NotFoundException('Ingrediente no encontrado');

    const costo = ingrediente.precioKg * dto.cantidad_usada;

    const nuevaRelacion = this.repo.create({
      ...dto,
      costo_ingrediente: costo,
    });

    await this.repo.save(nuevaRelacion);
    await this.actualizarCostoTotal(dto.id_receta);
    return { mensaje: 'Ingrediente agregado correctamente' };
  }

  findAll() {
    return this.repo.find({ relations: ['receta', 'ingrediente'] });
  }

  findByReceta(id_receta: number) {
    return this.repo.find({
      where: { id_receta },
      relations: ['ingrediente'],
    });
  }

  async remove(id_receta: number, id_ingrediente: number) {
    await this.repo.delete({ id_receta, id_ingrediente });
    await this.actualizarCostoTotal(id_receta);
    return { mensaje: 'Ingrediente eliminado de la receta' };
  }

  async updateCantidad(id_receta: number, id_ingrediente: number, nuevaCantidad: number) {
    const relacion = await this.repo.findOneBy({ id_receta, id_ingrediente });
    if (!relacion) throw new NotFoundException('Relación no encontrada');

    const ingrediente = await this.ingredienteRepo.findOneBy({ id: id_ingrediente });
    if (!ingrediente) throw new NotFoundException('Ingrediente no encontrado');

    relacion.cantidad_usada = nuevaCantidad;
    relacion.costo_ingrediente = ingrediente.precioKg * nuevaCantidad;

    await this.repo.save(relacion);
    await this.actualizarCostoTotal(id_receta);

    return { mensaje: 'Cantidad actualizada correctamente' };
  }

  async actualizarCostoTotal(id_receta: number) {
    const receta = await this.recetaRepo.findOneBy({ id: id_receta });
    if (!receta) throw new NotFoundException('Receta no encontrada');

    const ingredientes = await this.repo.find({ where: { id_receta } });

    const nuevoCostoTotal = ingredientes.reduce((acc, ing) => acc + Number(ing.costo_ingrediente || 0), 0);

    // Guardamos con 2 decimales como número
    receta.costoReceta = Math.round(nuevoCostoTotal * 100) / 100;
    await this.recetaRepo.save(receta);
  }
}
