import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecetaIngrediente } from './entities/receta_ingrediente.entity';
import { CreateRecetaIngredienteDto } from './dto/create-receta_ingrediente.dto';

@Injectable()
export class RecetasIngredientesService {
  constructor(
    @InjectRepository(RecetaIngrediente)
    private readonly repo: Repository<RecetaIngrediente>,
  ) {}

  create(dto: CreateRecetaIngredienteDto) {
    const nuevaRelacion = this.repo.create(dto);
    return this.repo.save(nuevaRelacion);
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
}
