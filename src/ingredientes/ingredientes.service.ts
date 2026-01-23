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

  // =================================================================
  // 1. CREAR INGREDIENTE (CON LÓGICA DE ALTA COCINA)
  // =================================================================
  async create(dto: CreateIngredienteDto) {
    // 1. Valores por defecto para la lógica nueva
    const rendimiento = dto.rendimiento || 100;    // Si no envía, rinde 100%
    const pesoUnitario = dto.peso_unitario || 1;   // Si es Kg/L, pesa 1. Si es Unidad, lo que diga el usuario.

    // 2. Calculamos el peso total estandarizado a Kg
    // (Ej: Si meten 5 "Unidades" de 1.5kg c/u -> pesoKgCalculado = 7.5)
    const pesoKgCalculado = this.convertirAKg(dto.peso || 0, dto.unidad_medida, pesoUnitario);

    const ingrediente = this.ingredienteRepository.create({
      nombre_ingrediente: dto.nombre_ingrediente,
      unidad_medida: dto.unidad_medida,
      peso: dto.peso,
      
      // Datos nuevos
      peso_unitario: pesoUnitario,
      pesoKg: pesoKgCalculado, // Stock normalizado
      precioKg: dto.precioKg,  // Precio de Compra
      rendimiento: rendimiento,// Merma
      
      grupo: dto.grupo,
    });

    // Nota: Al hacer .save(), la ENTITY ejecuta @BeforeInsert y calcula 'precio_real' automáticamente.
    return await this.ingredienteRepository.save(ingrediente);
  }

  // =================================================================
  // 2. LISTAR TODOS
  // =================================================================
  findAll() {
    return this.ingredienteRepository.find({ 
      order: { nombre_ingrediente: 'ASC' } 
    });
  }

  // =================================================================
  // 3. OBTENER UNO (CON COMPRAS)
  // =================================================================
  async findOne(id: number) {
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id },
      relations: ['compras'], 
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con id ${id} no encontrado`);
    }

    return ingrediente;
  }

  // =================================================================
  // 4. ACTUALIZAR (RECALCULANDO KILOS Y PRECIOS)
  // =================================================================
  async update(id: number, dto: UpdateIngredienteDto) {
    // Usamos preload para mezclar los datos viejos con los nuevos
    const ingrediente = await this.ingredienteRepository.preload({
      id: id,
      ...dto,
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con id ${id} no encontrado`);
    }

    // LÓGICA DE RE-CALCULO DE INVENTARIO (PESO EN KG)
    // Si cambiaron el peso, la unidad, o el peso de la unidad, hay que recalcular el total en Kg
    if (dto.peso !== undefined || dto.unidad_medida !== undefined || dto.peso_unitario !== undefined) {
      
      // Si no viene en el DTO, usamos el que ya tenía la entidad
      const pesoFinal = dto.peso !== undefined ? dto.peso : ingrediente.peso;
      const unidadFinal = dto.unidad_medida || ingrediente.unidad_medida;
      const pesoUnitarioFinal = dto.peso_unitario || ingrediente.peso_unitario;

      ingrediente.pesoKg = this.convertirAKg(pesoFinal, unidadFinal, pesoUnitarioFinal);
    }

    // Al guardar, el hook @BeforeUpdate de la Entidad recalculará el 'precio_real'
    // si cambió el precioKg o el rendimiento.
    return await this.ingredienteRepository.save(ingrediente);
  }

  // =================================================================
  // 5. ELIMINAR (SOFT DELETE)
  // =================================================================
  async remove(id: number) {
    const result = await this.ingredienteRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Ingrediente con id ${id} no encontrado`);
    }

    return { mensaje: 'Ingrediente eliminado correctamente (se mantiene en histórico)' };
  }

  // =================================================================
  // HELPER: CONVERSOR INTELIGENTE
  // =================================================================
  private convertirAKg(cantidad: number, unidad: string, pesoUnitario: number = 1): number {
    const u = unidad.toLowerCase().trim();
    
    // 1. Unidades pequeñas
    if (u === 'g' || u === 'gramos' || u === 'ml' || u === 'mililitros') {
      return cantidad / 1000;
    }
    
    // 2. Sistema Imperial
    if (u === 'lb' || u === 'libras' || u === 'libra') {
      return cantidad * 0.453592;
    }

    // 3. Unidades Abstractas (Atados, Unidades, Piezas)
    // Aquí usamos el 'peso_unitario' que definimos en la Entidad
    if (u === 'unidad' || u === 'unidades' || u === 'atado' || u === 'pieza' || u === 'caja') {
      return cantidad * pesoUnitario;
    }

    // 4. Default: Kg, Litros (Se asume 1 a 1)
    return cantidad; 
  }
}