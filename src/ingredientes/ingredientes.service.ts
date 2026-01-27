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
  // 1. CREAR INGREDIENTE (CON LOGICA DE TEST DE MERMA)
  // =================================================================
  async create(dto: CreateIngredienteDto) {
    
    // 1. Mapeo de campos del Test de Rendimiento
    // Si no vienen datos, asumimos valores neutros (sin merma)
    const pesoBruto = dto.peso_bruto || 1;
    const pesoNeto = dto.peso_neto || 1;
    const pesoDesperdicio = dto.peso_desperdicio || 0;
    const pesoSubproducto = dto.peso_subproducto || 0;

    // 2. Cálculo inicial de STOCK (Inventario)
    // Al crear un ingrediente, usualmente no hay stock hasta que se compra,
    // pero si el usuario quiere iniciar con un valor, usamos 'pesoKg' o convertimos 'peso_bruto'.
    // Estandarizamos: Si no envían stock explícito, iniciamos en 0.
    const stockInicial = 0; 

    const ingrediente = this.ingredienteRepository.create({
      nombre_ingrediente: dto.nombre_ingrediente,
      unidad_medida: dto.unidad_medida,
      grupo: dto.grupo,
      
      // PRECIOS
      precioKg: dto.precioKg,  // Precio Compra

      // DATOS DE TRANSFORMACIÓN (LO NUEVO)
      peso_bruto: pesoBruto,
      peso_neto: pesoNeto,
      peso_desperdicio: pesoDesperdicio,
      peso_subproducto: pesoSubproducto,

      // DATOS DE INVENTARIO
      pesoKg: stockInicial, // El stock se alimenta con el módulo de COMPRAS
      
      // CALCULADOS (Se pueden pasar, pero el @BeforeInsert de la entidad tiene la última palabra)
      rendimiento: dto.rendimiento || 100,
      peso_unitario: dto.peso_unitario || (pesoNeto > 0 ? pesoBruto / pesoNeto : 1),
    });

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
  // 4. ACTUALIZAR (RECALCULANDO TEST DE MERMA)
  // =================================================================
  async update(id: number, dto: UpdateIngredienteDto) {
    // Usamos preload para mezclar los datos viejos con los nuevos
    const ingrediente = await this.ingredienteRepository.preload({
      id: id,
      ...dto, // TypeORM mapea automáticamente los campos coincidentes
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con id ${id} no encontrado`);
    }

    // NOTA: No necesitamos recalcular manualmente aquí.
    // Al hacer .save(), la entidad ejecuta @BeforeUpdate,
    // tomando los nuevos peso_bruto/peso_neto y actualizando
    // rendimiento, factor y precio_real automáticamente.

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

    return { mensaje: 'Ingrediente eliminado correctamente' };
  }

  // =================================================================
  // HELPER: CONVERSOR INTELIGENTE (UTILITARIO PARA OTROS MÓDULOS)
  // =================================================================
  // Dejamos este helper público por si ComprasService lo necesita
  public convertirAKg(cantidad: number, unidad: string, pesoUnitario: number = 1): number {
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
    if (u === 'unidad' || u === 'unidades' || u === 'atado' || u === 'pieza' || u === 'caja') {
      return cantidad * pesoUnitario;
    }

    // 4. Default: Kg, Litros (Se asume 1 a 1)
    return cantidad; 
  }
}