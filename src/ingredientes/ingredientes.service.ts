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

    // Nota: Eliminé la lógica de buscar compra aquí porque ahora es al revés:
    // Las compras crean stock, no creamos ingredientes vinculados a una compra vieja manualmente.
    
    const ingrediente = this.ingredienteRepository.create({
      nombre_ingrediente: dto.nombre_ingrediente,
      unidad_medida: dto.unidad_medida,
      peso: dto.peso,
      pesoKg: pesoKgCalculado,
      precioKg: dto.precioKg,
      grupo: dto.grupo,
    });

    return this.ingredienteRepository.save(ingrediente);
  }

  findAll() {
    // TypeORM automáticamente filtra los que tienen deletedAt != null
    return this.ingredienteRepository.find({ 
      order: { nombre_ingrediente: 'ASC' } 
    });
  }

  async findOne(id: number) {
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id },
      relations: ['compras'], // Para ver el historial de compras de este ingrediente
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con id ${id} no encontrado`);
    }

    return ingrediente;
  }

  async update(id: number, dto: UpdateIngredienteDto) {
    const ingrediente = await this.ingredienteRepository.findOneBy({ id });
    if (!ingrediente) throw new NotFoundException('Ingrediente no encontrado');

    // Actualizamos campos básicos
    if (dto.nombre_ingrediente) ingrediente.nombre_ingrediente = dto.nombre_ingrediente;
    if (dto.unidad_medida) ingrediente.unidad_medida = dto.unidad_medida;
    if (dto.grupo) ingrediente.grupo = dto.grupo;
    
    // Si editan peso o precio manualmente (Ajuste de inventario)
    if (dto.peso !== undefined) {
      ingrediente.peso = dto.peso;
      ingrediente.pesoKg = this.convertirAKg(dto.peso, ingrediente.unidad_medida);
    }
    if (dto.precioKg !== undefined) ingrediente.precioKg = dto.precioKg;

    return this.ingredienteRepository.save(ingrediente);
  }

  // 👇 AQUÍ ESTÁ EL CAMBIO CLAVE
  async remove(id: number) {
    // Usamos softDelete en lugar de delete/remove
    const result = await this.ingredienteRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Ingrediente con id ${id} no encontrado`);
    }

    return { mensaje: 'Ingrediente eliminado correctamente (se mantiene en histórico)' };
  }

  private convertirAKg(peso: number, unidad: string): number {
    const u = unidad.toLowerCase();
    if (u === 'g' || u === 'gramos' || u === 'ml') return peso / 1000;
    if (u === 'lb' || u === 'libras') return peso * 0.453592;
    return peso; // kg, l, u
  }
}