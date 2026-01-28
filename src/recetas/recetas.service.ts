import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity'; 
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,

    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,
  ) {}

  // =================================================================
  // 1. CREAR RECETA (CON CONVERSIÓN DE TIPOS)
  // =================================================================
  async create(dto: CreateRecetaDto, user: any) {
    const nueva = this.recetaRepository.create({
      // Mapeo Manual
      nombreReceta: dto.nombre_receta,
      tipoPlato: dto.tipo_plato,
      procedimiento: dto.procedimiento,
      
      // 👇 CORRECCIÓN DEL ERROR: Forzamos la conversión a Número
      numPorciones: Number(dto.num_porciones), 
      tamanoPorcion: Number(dto.tamano_porcion), // Esto arregla el error "string is not assignable to number"
      costoReceta: Number(dto.costo_receta),
      rentabilidad: Number(dto.rentabilidad),
      precioVenta: Number(dto.precio_venta),

      recetasIngredientes: dto.recetasIngredientes,

      // Asignación de dueño
      usuario: user 
    });

    return await this.recetaRepository.save(nueva);
  }

  // =================================================================
  // 2. LISTAR RECETAS
  // =================================================================
  async findAll(user: any) {
    const relations = ['usuario']; 
    const order: any = { id: 'DESC' };

    if (user.rol === 'profesor' || user.rol === 'admin') {
      return this.recetaRepository.find({ order, relations });
    } 

    return this.recetaRepository.find({
      where: { usuario: { id: user.id } },
      order,
      relations
    });
  }

  // =================================================================
  // 3. OBTENER UNA
  // =================================================================
  async findOne(id: number, user: any) {
    const receta = await this.recetaRepository.findOne({
      where: { id },
      relations: [
        'recetasIngredientes',
        'recetasIngredientes.ingrediente',
        'usuario'
      ],
    });

    if (!receta) throw new NotFoundException(`Receta no encontrada`);

    const esProfesor = user.rol === 'profesor' || user.rol === 'admin';
    const esDuenio = receta.usuario && receta.usuario.id === user.id;

    if (!esProfesor && !esDuenio) {
        throw new ForbiddenException('No tienes permiso para ver esta receta');
    }

    return receta;
  }

  // =================================================================
  // 4. ACTUALIZAR
  // =================================================================
  async update(id: number, dto: UpdateRecetaDto, user: any) {
    const recetaOriginal = await this.recetaRepository.findOne({ 
        where: { id }, 
        relations: ['usuario'] 
    });

    if (!recetaOriginal) throw new NotFoundException(`Receta no encontrada`);

    const esProfesor = user.rol === 'profesor' || user.rol === 'admin';
    const esDuenio = recetaOriginal.usuario && recetaOriginal.usuario.id === user.id;

    if (!esProfesor && !esDuenio) {
        throw new ForbiddenException('No tienes permiso para editar esta receta');
    }

    // Preparar actualización con conversiones seguras
    const datosActualizados: any = {};
    if (dto.nombre_receta) datosActualizados.nombreReceta = dto.nombre_receta;
    if (dto.tipo_plato) datosActualizados.tipoPlato = dto.tipo_plato;
    if (dto.procedimiento) datosActualizados.procedimiento = dto.procedimiento;

    // 👇 CONVERSIONES TAMBIÉN AQUÍ
    if (dto.costo_receta !== undefined) datosActualizados.costoReceta = Number(dto.costo_receta);
    if (dto.num_porciones !== undefined) datosActualizados.numPorciones = Number(dto.num_porciones);
    if (dto.tamano_porcion !== undefined) datosActualizados.tamanoPorcion = Number(dto.tamano_porcion);
    if (dto.rentabilidad !== undefined) datosActualizados.rentabilidad = Number(dto.rentabilidad);
    if (dto.precio_venta !== undefined) datosActualizados.precioVenta = Number(dto.precio_venta);

    if (dto.recetasIngredientes) datosActualizados.recetasIngredientes = dto.recetasIngredientes;

    const receta = await this.recetaRepository.preload({
      id,
      ...datosActualizados, 
    });

    if (!receta) throw new NotFoundException(`Error al actualizar`);

    return this.recetaRepository.save(receta);
  }

  // =================================================================
  // 5. ELIMINAR
  // =================================================================
  async remove(id: number, user: any) {
    const receta = await this.findOne(id, user); 
    return this.recetaRepository.softRemove(receta);
  }

  // =================================================================
  // 6. CONVERTIR EN INGREDIENTE
  // =================================================================
  async convertirEnIngrediente(id: number, user: any) {
    const receta = await this.findOne(id, user);

    let pesoTotalPreparacion = 0;
    receta.recetasIngredientes.forEach((item) => {
      pesoTotalPreparacion += Number(item.cantidad_usada);
    });
    if (pesoTotalPreparacion <= 0) pesoTotalPreparacion = 1;

    const costoTotal = receta.recetasIngredientes.reduce((acc, item) => {
      const precioCalculo = Number(item.costo_historico) > 0 
          ? Number(item.costo_historico) 
          : Number(item.ingrediente.precio_real);
      return acc + (Number(item.cantidad_usada) * precioCalculo);
    }, 0);

    const precioPorKilo = costoTotal / pesoTotalPreparacion;

    const nuevoIngrediente = this.ingredienteRepository.create({
      nombre_ingrediente: `${receta.nombreReceta} (Prep)`,
      unidad_medida: 'kg', 
      grupo: 'PREPARACIONES',
      precioKg: precioPorKilo, 
      peso_bruto: 1,
      peso_neto: 1,
      rendimiento: 100,
      peso_unitario: 1,
      precio_real: precioPorKilo,
      es_preparacion: true,
      usuario: user 
    });

    return await this.ingredienteRepository.save(nuevoIngrediente);
  }
}