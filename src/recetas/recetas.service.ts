import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity'; // 👈 IMPORTANTE: Importamos la entidad Ingrediente
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,

    // 👇 INYECCIÓN NUEVA: Necesaria para poder guardar la Receta como Ingrediente
    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,
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

      // 👇 NUEVOS CAMPOS
      rentabilidad: dto.rentabilidad,
      precioVenta: dto.precio_venta,

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
    
    // 👇 NUEVOS CAMPOS EN UPDATE
    if (dto.rentabilidad !== undefined) datosActualizados.rentabilidad = dto.rentabilidad;
    if (dto.precio_venta !== undefined) datosActualizados.precioVenta = dto.precio_venta;

    // Si vienen ingredientes nuevos
    if (dto.recetasIngredientes) {
      datosActualizados.recetasIngredientes = dto.recetasIngredientes;
    }

    const receta = await this.recetaRepository.preload({
      id,
      ...datosActualizados, 
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
    return this.recetaRepository.softRemove(receta);
  }

  // =================================================================
  // 7. 🔥 NUEVO: CONVERTIR RECETA EN SUB-FICHA (INGREDIENTE)
  // =================================================================
  async convertirEnIngrediente(id: number) {
    // 1. Buscamos la receta completa con sus ingredientes para calcular pesos
    const receta = await this.recetaRepository.findOne({
      where: { id },
      relations: ['recetasIngredientes', 'recetasIngredientes.ingrediente'],
    });

    if (!receta) throw new NotFoundException('Receta no encontrada');

    // 2. Calculamos el Peso Total de la preparación (Suma de cantidades usadas)
    // Esto es vital para saber cuánto pesa la "olla" final.
    let pesoTotalPreparacion = 0;
    
    receta.recetasIngredientes.forEach((item) => {
      // Sumamos la cantidad neta usada (asumiendo que está en Kg/Lt)
      pesoTotalPreparacion += Number(item.cantidad_usada);
    });

    // Validación de seguridad para evitar divisiones por cero
    if (pesoTotalPreparacion <= 0) pesoTotalPreparacion = 1;

    // 3. Calculamos el Costo Real Total (Recalculamos por seguridad)
    const costoTotal = receta.recetasIngredientes.reduce((acc, item) => {
      // Usamos costo histórico si existe, si no, el precio actual del ingrediente
      const precioCalculo = Number(item.costo_historico) > 0 
          ? Number(item.costo_historico) 
          : Number(item.ingrediente.precio_real);
          
      const costoItem = Number(item.cantidad_usada) * precioCalculo;
      return acc + costoItem;
    }, 0);

    // 4. Calculamos precio por Kilo de la nueva "Subficha"
    const precioPorKilo = costoTotal / pesoTotalPreparacion;

    // 5. Creamos el ingrediente en la base de datos
    const nuevoIngrediente = this.ingredienteRepository.create({
      nombre_ingrediente: `${receta.nombreReceta} (Prep)`, // Sufijo para identificar
      unidad_medida: 'kg', // Estandarizamos a Kg para subfichas
      grupo: 'PREPARACIONES',
      
      // Costos calculados
      precioKg: precioPorKilo, 
      
      // Como es producto terminado, no tiene merma inicial
      peso_bruto: 1,
      peso_neto: 1,
      rendimiento: 100,
      peso_unitario: 1,
      precio_real: precioPorKilo,

      // Marcamos que viene de una receta
      es_preparacion: true, 
    });

    return await this.ingredienteRepository.save(nuevoIngrediente);
  }
}