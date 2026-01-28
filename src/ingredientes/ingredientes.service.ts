import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
  // 1. CREAR INGREDIENTE (ASIGNANDO DUEÑO)
  // =================================================================
  async create(dto: CreateIngredienteDto, user: any) {
    
    const pesoBruto = dto.peso_bruto || 1;
    const pesoNeto = dto.peso_neto || 1;
    const pesoDesperdicio = dto.peso_desperdicio || 0;
    const pesoSubproducto = dto.peso_subproducto || 0;
    const stockInicial = 0; 

    const ingrediente = this.ingredienteRepository.create({
      ...dto, // Copia todas las propiedades simples del DTO
      
      // CALCULOS DE MERMA
      peso_bruto: pesoBruto,
      peso_neto: pesoNeto,
      peso_desperdicio: pesoDesperdicio,
      peso_subproducto: pesoSubproducto,
      pesoKg: stockInicial, 
      rendimiento: dto.rendimiento || 100,
      peso_unitario: dto.peso_unitario || (pesoNeto > 0 ? pesoBruto / pesoNeto : 1),

      // 🔐 ASIGNACIÓN DE DUEÑO
      // TypeORM enlazará esto con la columna usuario_id automáticamente
      usuario: user 
    });

    return await this.ingredienteRepository.save(ingrediente);
  }

  // =================================================================
  // 2. LISTAR (CON FILTRO DE SEGURIDAD)
  // =================================================================
  findAll(user: any) {
    // LÓGICA DE ROLES
    // Si es Profesor (o admin), ve TODO.
    // Ajusta 'profesor' según como se llame el rol en tu DB (ej: 'admin', 'docente')
    if (user.rol === 'profesor' || user.rol === 'admin') {
        return this.ingredienteRepository.find({ 
            order: { nombre_ingrediente: 'ASC' } 
        });
    }

    // Si es Alumno, solo ve SUS ingredientes
    return this.ingredienteRepository.find({ 
      where: { usuario: { id: user.id } }, // Filtra por el usuario conectado
      order: { nombre_ingrediente: 'ASC' } 
    });
  }

  // =================================================================
  // 3. OBTENER UNO
  // =================================================================
  async findOne(id: number, user: any) { // Añade 'user' si quieres proteger también la vista individual
    const options: any = {
        where: { id },
        relations: ['compras'],
    };

    // Si no es profesor, forzamos que el usuario coincida
    if (user.rol !== 'profesor' && user.rol !== 'admin') {
        options.where.usuario = { id: user.id };
    }

    const ingrediente = await this.ingredienteRepository.findOne(options);

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente no encontrado o no tienes permiso para verlo`);
    }

    return ingrediente;
  }

  // =================================================================
  // 4. ACTUALIZAR (SOLO PROPIETARIO)
  // =================================================================
  async update(id: number, dto: UpdateIngredienteDto, user: any) {
    // 1. Verificación de seguridad (manual)
    const ingredienteOriginal = await this.ingredienteRepository.findOne({ 
        where: { id }, 
        relations: ['usuario'] 
    });

    if (!ingredienteOriginal) {
        throw new NotFoundException(`Ingrediente no encontrado`);
    }

    // Verificar si es dueño o profesor
    const esProfesor = user.rol === 'profesor' || user.rol === 'admin';
    const esDuenio = ingredienteOriginal.usuario && ingredienteOriginal.usuario.id === user.id;

    if (!esProfesor && !esDuenio) {
        throw new ForbiddenException('No tienes permiso para editar este ingrediente');
    }

    // 2. Preload: Mezcla los datos nuevos con los viejos
    const ingredienteActualizado = await this.ingredienteRepository.preload({
      id: id,
      ...dto,
    });

    // 👇 ESTA ES LA CORRECCIÓN DEL ERROR
    // TypeScript se quejaba porque 'ingredienteActualizado' podía ser undefined.
    // Con este 'if', le garantizamos que si es undefined, lanzamos error y no llega al save.
    if (!ingredienteActualizado) {
      throw new NotFoundException(`Error al intentar actualizar el ingrediente`);
    }

    return await this.ingredienteRepository.save(ingredienteActualizado);
  }

  // =================================================================
  // 5. ELIMINAR (SOLO PROPIETARIO)
  // =================================================================
  async remove(id: number, user: any) {
    
    // 1. Verificar propiedad antes de borrar
    const ingrediente = await this.ingredienteRepository.findOne({ 
        where: { id }, 
        relations: ['usuario'] 
    });

    if (!ingrediente) throw new NotFoundException('Ingrediente no encontrado');

    const esProfesor = user.rol === 'profesor' || user.rol === 'admin';
    const esDuenio = ingrediente.usuario && ingrediente.usuario.id === user.id;

    if (!esProfesor && !esDuenio) {
        throw new ForbiddenException('No tienes permiso para eliminar este ingrediente');
    }

    // 2. Ejecutar borrado
    const result = await this.ingredienteRepository.softDelete(id);
    return { mensaje: 'Ingrediente eliminado correctamente' };
  }

  // ... helper convertirAKg sigue igual ...
  public convertirAKg(cantidad: number, unidad: string, pesoUnitario: number = 1): number {
    const u = unidad.toLowerCase().trim();
    if (u === 'g' || u === 'gramos' || u === 'ml' || u === 'mililitros') return cantidad / 1000;
    if (u === 'lb' || u === 'libras' || u === 'libra') return cantidad * 0.453592;
    if (u === 'unidad' || u === 'unidades' || u === 'atado' || u === 'pieza' || u === 'caja') return cantidad * pesoUnitario;
    return cantidad; 
  }
}