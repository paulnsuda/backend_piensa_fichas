// backend/src/ingredientes/ingredientes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingrediente } from './entities/ingrediente.entity';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
import { Compra } from '../compras/entities/compra.entity';

@Injectable()
export class IngredientesService {
  constructor(
    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,

    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
  ) {}

  async create(dto: CreateIngredienteDto) {
    const pesoKgCalculado = this.convertirAKg(dto.peso, dto.unidad_medida);

    const compra = dto.id_compra
      ? await this.compraRepository.findOneBy({ id: dto.id_compra })
      : null;

    if (dto.id_compra && !compra) {
      throw new NotFoundException(`Compra con id ${dto.id_compra} no encontrada`);
    }

    const ingrediente = this.ingredienteRepository.create({
      nombre_ingrediente: dto.nombre_ingrediente,
      unidad_medida: dto.unidad_medida,
      peso: dto.peso,
      pesoKg: pesoKgCalculado,
      precioKg: dto.precioKg,
      grupo: dto.grupo,
      compra: compra ?? undefined,
    });

    return this.ingredienteRepository.save(ingrediente);
  }

  findAll() {
    return this.ingredienteRepository.find({ relations: ['compra'] });
  }

  async findOne(id: number) {
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id },
      relations: ['compra'],
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con id ${id} no encontrado`);
    }

    return ingrediente;
  }

  async update(id: number, dto: UpdateIngredienteDto) {
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id },
      relations: ['compra'],
    });

    if (!ingrediente) {
      throw new NotFoundException('Ingrediente no encontrado');
    }

    if (dto.id_compra) {
      const compra = await this.compraRepository.findOneBy({ id: dto.id_compra });
      if (!compra) {
        throw new NotFoundException(`Compra con id ${dto.id_compra} no encontrada`);
      }
      ingrediente.compra = compra;
    }

    ingrediente.nombre_ingrediente = dto.nombre_ingrediente ?? ingrediente.nombre_ingrediente;
    ingrediente.unidad_medida = dto.unidad_medida ?? ingrediente.unidad_medida;
    ingrediente.peso = dto.peso ?? ingrediente.peso;
    ingrediente.precioKg = dto.precioKg ?? ingrediente.precioKg;
    ingrediente.pesoKg = this.convertirAKg(ingrediente.peso, ingrediente.unidad_medida);
    ingrediente.grupo = dto.grupo ?? ingrediente.grupo;

    return this.ingredienteRepository.save(ingrediente);
  }

  async remove(id: number) {
    const ingrediente = await this.ingredienteRepository.findOneBy({ id });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con id ${id} no encontrado`);
    }

    return this.ingredienteRepository.remove(ingrediente);
  }

  private convertirAKg(peso: number, unidad: string): number {
    switch (unidad) {
      case 'g': return peso / 1000;
      case 'lb': return peso * 0.453592;
      case 'kg': return peso;
      default: return 0;
    }
  }
}
