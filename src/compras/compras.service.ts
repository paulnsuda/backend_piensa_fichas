import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,

    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,
  ) {}

  // =================================================================
  // 1. REGISTRAR COMPRA (Y ACTUALIZAR STOCK DEL USUARIO)
  // =================================================================
  async create(dto: CreateCompraDto, user: any) {
    
    // 1. Buscar el ingrediente (Traemos al dueño para verificar)
    const ingrediente = await this.ingredienteRepository.findOne({ 
      where: { id: dto.id_ingrediente },
      relations: ['usuario'] // 👈 Importante para verificar propiedad
    });
    
    if (!ingrediente) throw new NotFoundException('Ingrediente no encontrado.');

    // 🔒 SEGURIDAD: Verificar que el ingrediente pertenece al usuario
    // (A menos que sea profesor/admin, quien puede editar el stock de cualquiera)
    const esProfesor = user.rol === 'profesor' || user.rol === 'admin';
    const esDuenio = ingrediente.usuario && ingrediente.usuario.id === user.id;

    if (!esProfesor && !esDuenio) {
        throw new ForbiddenException('No puedes agregar stock a un ingrediente que no es tuyo.');
    }

    // 2. Crear el registro de compra vinculado al USUARIO
    const compra = this.compraRepository.create({
      ...dto,
      proveedor: { id: dto.id_proveedor },
      ingrediente: { id: dto.id_ingrediente },
      usuario: user // 👈 Asignamos la compra al usuario conectado
    });

    // 3. 🚀 ACTUALIZACIÓN DE INVENTARIO (STOCK)
    const stockActual = Number(ingrediente.pesoKg) || 0;
    const stockNuevo = Number(dto.peso_kg) || 0;
    
    ingrediente.pesoKg = stockActual + stockNuevo;

    // 4. 💲 ACTUALIZACIÓN DE PRECIO PROMEDIO/ACTUAL
    // Si la compra trajo peso, actualizamos el precio/kg del ingrediente
    if (stockNuevo > 0) {
      ingrediente.precioKg = Number(dto.costo_final) / stockNuevo; // Ojo: dto.costo_total (tu entity dice costo_total)
    }

    // 5. Guardar cambios
    await this.ingredienteRepository.save(ingrediente); // Se recalcula precio real por el @BeforeUpdate
    return this.compraRepository.save(compra);
  }

  // =================================================================
  // 2. LISTAR (FILTRADO POR USUARIO)
  // =================================================================
  findAll(user: any) {
    const relations = ['proveedor', 'ingrediente'];
    const order: any = { fecha_compra: 'DESC' };

    // Si es Profesor, ve TODO
    if (user.rol === 'profesor' || user.rol === 'admin') {
        return this.compraRepository.find({ relations, order });
    }

    // Si es Alumno, solo ve SUS compras
    return this.compraRepository.find({ 
      where: { usuario: { id: user.id } }, 
      relations, 
      order 
    });
  }

  // =================================================================
  // 3. OBTENER UNA (SEGURIDAD)
  // =================================================================
  async findOne(id: number, user: any) {
    const compra = await this.compraRepository.findOne({ 
      where: { id },
      relations: ['proveedor', 'ingrediente', 'usuario']
    });

    if (!compra) throw new NotFoundException('Compra no encontrada');

    // Verificar permisos
    const esProfesor = user.rol === 'profesor' || user.rol === 'admin';
    const esDuenio = compra.usuario && compra.usuario.id === user.id;

    if (!esProfesor && !esDuenio) {
        throw new ForbiddenException('No tienes permiso para ver esta compra');
    }

    return compra;
  }

  // =================================================================
  // 4. ELIMINAR (Y REVERTIR STOCK - OPCIONAL PERO RECOMENDADO)
  // =================================================================
  async remove(id: number, user: any) {
      const compra = await this.findOne(id, user); // Reutilizamos findOne para checar seguridad

      // Al borrar una compra, deberíamos restar el stock que esa compra sumó
      if (compra.ingrediente) {
          const ingrediente = await this.ingredienteRepository.findOne({ where: { id: compra.ingrediente.id } });
          if (ingrediente) {
              const stockActual = Number(ingrediente.pesoKg) || 0;
              const stockRestar = Number(compra.peso_kg) || 0;
              // Evitar stock negativo
              ingrediente.pesoKg = Math.max(0, stockActual - stockRestar);
              await this.ingredienteRepository.save(ingrediente);
          }
      }

      return this.compraRepository.remove(compra);
  }
}