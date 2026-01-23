import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>
  ) {}

  // =================================================================
  // 1. CREAR RECETA (CON RENTABILIDAD Y PRECIO VENTA)
  // =================================================================
  async create(dto: CreateRecetaDto, user: any) {
    const nueva = this.recetaRepository.create({
      // 🟢 MAPEO MANUAL (Frontend snake_case -> Backend camelCase)
      
      nombreReceta: dto.nombre_receta,
      tipoPlato: dto.tipo_plato,
      numPorciones: dto.num_porciones,
      tamanoPorcion: dto.tamano_porcion,
      procedimiento: dto.procedimiento,
      costoReceta: dto.costo_receta,

      // 👇 NUEVOS CAMPOS (Lo que agregamos hoy)
      rentabilidad: dto.rentabilidad,  // Mismo nombre
      precioVenta: dto.precio_venta,   // Mapeo: precio_venta -> precioVenta

      // Relación de ingredientes (cascade: true hace el trabajo sucio)
      recetasIngredientes: dto.recetasIngredientes,

      // Asignamos el usuario conectado
      usuario: { id: user.userId } 
    });

    return await this.recetaRepository.save(nueva);
  }

  // =================================================================
  // 2. LISTAR RECETAS (SEGÚN ROL)
  // =================================================================
  async findAll(user: any) {
    if (!user) return [];

    if (user.rol === 'profesor' || user.rol === 'admin') {
      // Profesor ve todo
      return this.recetaRepository.find({
        order: { id: 'DESC' },
        relations: ['usuario']
      });
    } else {
      // Alumno ve solo lo suyo
      return this.recetaRepository.find({
        where: { usuario: { id: user.userId } },
        order: { id: 'DESC' },
        relations: ['usuario']
      });
    }
  }

  // =================================================================
  // 3. OBTENER UNA (FICHA TÉCNICA COMPLETA)
  // =================================================================
  async findOne(id: number) {
    const receta = await this.recetaRepository.findOne({
      where: { id },
      relations: [
        'recetasIngredientes',              // Tabla intermedia
        'recetasIngredientes.ingrediente',  // Datos reales del ingrediente
        'usuario'
      ],
    });

    if (!receta) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }

    return receta;
  }

  // =================================================================
  // 4. LISTAR CON INGREDIENTES (AUXILIAR)
  // =================================================================
  findAllConIngredientes() {
    return this.recetaRepository.find({
      relations: ['recetasIngredientes', 'recetasIngredientes.ingrediente'],
    });
  }

  // =================================================================
  // 5. ACTUALIZAR (CON MAPEO MANUAL TAMBIÉN)
  // =================================================================
  async update(id: number, dto: UpdateRecetaDto) {
    // Creamos un objeto auxiliar mapeando los nombres
    const datosActualizados: any = {};
    
    if (dto.nombre_receta) datosActualizados.nombreReceta = dto.nombre_receta;
    if (dto.costo_receta) datosActualizados.costoReceta = dto.costo_receta;
    if (dto.tipo_plato) datosActualizados.tipoPlato = dto.tipo_plato;
    if (dto.num_porciones) datosActualizados.numPorciones = dto.num_porciones;
    if (dto.tamano_porcion) datosActualizados.tamanoPorcion = dto.tamano_porcion;
    if (dto.procedimiento) datosActualizados.procedimiento = dto.procedimiento;
    
    // 👇 NUEVOS CAMPOS EN UPDATE (Validamos que no sea undefined)
    if (dto.rentabilidad !== undefined) datosActualizados.rentabilidad = dto.rentabilidad;
    if (dto.precio_venta !== undefined) datosActualizados.precioVenta = dto.precio_venta;

    // Si vienen ingredientes nuevos
    if (dto.recetasIngredientes) {
      datosActualizados.recetasIngredientes = dto.recetasIngredientes;
    }

    const receta = await this.recetaRepository.preload({
      id,
      ...datosActualizados, // Usamos el objeto mapeado
    });

    if (!receta) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }

    return this.recetaRepository.save(receta);
  }

  // =================================================================
  // 6. ELIMINAR (SOFT DELETE)
  // =================================================================
  async remove(id: number) {
    const receta = await this.recetaRepository.findOneBy({ id });
    if (!receta) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }
    // Usamos softRemove para mantener historial si es necesario, 
    // o remove() físico si prefieres borrarlo del todo.
    // Como tu entidad tiene @DeleteDateColumn, softRemove es lo ideal.
    return this.recetaRepository.softRemove(receta);
  }
}