import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>
  ) {}

  // Crear receta
  create(dto: CreateRecetaDto) {
    const nueva = this.recetaRepository.create(dto);
    return this.recetaRepository.save(nueva);
  }

  // Listar todas las recetas
  findAll() {
    return this.recetaRepository.find();
  }

  // Obtener receta con sus ingredientes (para ficha técnica)
  async findOne(id: number) {
    const receta = await this.recetaRepository.findOne({
      where: { id },
      relations: ['ingredientesRelacionados', 'ingredientesRelacionados.ingrediente'],
    });

    if (!receta) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }

    return receta;
  }

  // Obtener todas las recetas con ingredientes (opcional)
  findAllConIngredientes() {
    return this.recetaRepository.find({
      relations: ['ingredientesRelacionados', 'ingredientesRelacionados.ingrediente'],
    });
  }

  // Actualizar receta
  async update(id: number, dto: UpdateRecetaDto) {
    const receta = await this.recetaRepository.preload({
      id,
      ...dto,
    });
    if (!receta) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }
    return this.recetaRepository.save(receta);
  }

  // Eliminar receta
  async remove(id: number) {
    const receta = await this.recetaRepository.findOneBy({ id });
    if (!receta) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }
    return this.recetaRepository.remove(receta);
  }
}
