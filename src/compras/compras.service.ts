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
    // Nota: Usamos 'findOne' con where para asegurar compatibilidad
    const ingrediente = await this.ingredienteRepository.findOne({ 
      where: { id: dto.id_ingrediente } 
    });
    
    if (!ingrediente) throw new NotFoundException('Ingrediente no encontrado. Selecciona uno de la lista.');

    // 2. Crear el registro de compra
    const compra = this.compraRepository.create({
      ...dto,
      proveedor: { id: dto.id_proveedor },
      ingrediente: { id: dto.id_ingrediente },
    });

    // 3. 🚀 ACTUALIZACIÓN DE INVENTARIO (STOCK)
    // Solo actualizamos el peso estandarizado (Kg), que es el que usa el sistema ahora.
    // Usamos Number() para evitar concatenación de strings si vienen del JSON
    const stockActual = Number(ingrediente.pesoKg) || 0;
    const stockNuevo = Number(dto.peso_kg) || 0;
    
    ingrediente.pesoKg = stockActual + stockNuevo;

    // ❌ ELIMINADO: Ya no actualizamos 'ingrediente.peso' porque ese campo fue reemplazado 
    // por la lógica de Mermas (peso_bruto/neto) y Stock (pesoKg).

    // 4. 💲 ACTUALIZACIÓN DE PRECIO PROMEDIO/ACTUAL
    // Si la compra trajo peso, actualizamos el precio/kg del ingrediente al valor de mercado actual
    if (stockNuevo > 0) {
      // Precio Unitario = Costo Total / Cantidad en Kg
      ingrediente.precioKg = Number(dto.costo_final) / stockNuevo;
    }

    // 5. Guardar cambios en ambas tablas
    // Al guardar el ingrediente, el @BeforeUpdate de la entidad recalculará 
    // el 'precio_real' automáticamente basándose en el nuevo precioKg y la merma definida.
    await this.ingredienteRepository.save(ingrediente); 
    
    return this.compraRepository.save(compra);
  }

  findAll() {
    return this.compraRepository.find({ 
      relations: ['proveedor', 'ingrediente'],
      order: { fecha_compra: 'DESC' }
    });
  }

  findOne(id: number) {
    return this.compraRepository.findOne({ 
      where: { id },
      relations: ['proveedor', 'ingrediente']
    });
  }
}