import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingrediente } from './entities/ingrediente.entity';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';

@Injectable()
export class IngredientesService {
  constructor(
    @InjectRepository(Ingrediente)
    private ingredienteRepository: Repository<Ingrediente>
  ) {}

  create(dto: CreateIngredienteDto) {
    const nuevo = this.ingredienteRepository.create(dto);
    return this.ingredienteRepository.save(nuevo);
  }

  findAll() {
    return this.ingredienteRepository.find();
  }
}
