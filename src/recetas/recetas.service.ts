import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepo: Repository<Receta>,
  ) {}

  create(dto: CreateRecetaDto) {
    const nueva = this.recetaRepo.create(dto);
    return this.recetaRepo.save(nueva);
  }

  findAll() {
    return this.recetaRepo.find();
  }

  findOne(id: number) {
    return this.recetaRepo.findOne({ where: { id } });
  }

  async findAllConIngredientes() {
    return this.recetaRepo.find({
      relations: ['ingredientesRelacionados', 'ingredientesRelacionados.ingrediente'],
    });
  }

  async update(id: number, dto: UpdateRecetaDto) {
    await this.recetaRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.recetaRepo.delete(id);
  }
}
