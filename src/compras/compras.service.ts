import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity'; // 👈 Importante

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,

    @InjectRepository(Ingrediente) // 👈 Inyectamos el repo de ingredientes
    private readonly ingredienteRepository: Repository<Ingrediente>,
  ) {}

  async create(dto: CreateCompraDto) {
    // 1. Buscar el ingrediente que estamos comprando
    const ingrediente = await this.ingredienteRepository.findOneBy({ id: dto.id_ingrediente });
    if (!ingrediente) throw new NotFoundException('Ingrediente no encontrado. Selecciona uno de la lista.');

    // 2. Crear el registro de compra
    const compra = this.compraRepository.create({
      ...dto,
      proveedor: { id: dto.id_proveedor },
      ingrediente: { id: dto.id_ingrediente },
    });

    // 3. 🚀 ACTUALIZACIÓN DE INVENTARIO (STOCK)
    // A. Actualizamos el peso estandarizado (Kg)
    ingrediente.pesoKg = Number(ingrediente.pesoKg) + Number(dto.peso_kg);

    // B. Actualizamos el peso visual según la unidad del ingrediente (g, lb, kg...)
    const cantidadAgregada = this.convertirKgAUnidad(dto.peso_kg, ingrediente.unidad_medida);
    ingrediente.peso = Number(ingrediente.peso) + cantidadAgregada;

    // 4. 💲 ACTUALIZACIÓN DE PRECIO
    // Si la compra trajo peso, actualizamos el precio/kg del ingrediente al valor de mercado actual
    if (dto.peso_kg > 0) {
      // Precio Unitario = Costo Total / Cantidad en Kg
      ingrediente.precioKg = Number(dto.costo_final) / Number(dto.peso_kg);
    }

    // 5. Guardar cambios en ambas tablas
    await this.ingredienteRepository.save(ingrediente); // Guardamos stock nuevo
    return this.compraRepository.save(compra); // Guardamos la compra
  }

  findAll() {
    return this.compraRepository.find({ relations: ['proveedor', 'ingrediente'] });
  }

  findOne(id: number) {
    return this.compraRepository.findOne({ 
      where: { id },
      relations: ['proveedor', 'ingrediente']
    });
  }

  // 👇 Función auxiliar para convertir lo comprado (Kg) a la unidad del ingrediente
  private convertirKgAUnidad(kilos: number, unidad: string): number {
    const u = unidad.toLowerCase();
    if (u === 'g' || u === 'gramos' || u === 'ml') return kilos * 1000;
    if (u === 'lb' || u === 'libras') return kilos * 2.20462;
    // Si es 'kg', 'l' o 'u', se suma directo
    return kilos;
  }
}