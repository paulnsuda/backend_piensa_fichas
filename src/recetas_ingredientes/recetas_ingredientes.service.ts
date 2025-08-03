import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecetaIngrediente } from './entities/receta_ingrediente.entity';
import { CreateRecetaIngredienteDto } from './dto/create-receta_ingrediente.dto';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';
import { Receta } from '../recetas/entities/receta.entity';

@Injectable()
export class RecetaIngredienteService {
  constructor(
    @InjectRepository(RecetaIngrediente)
    private readonly repo: Repository<RecetaIngrediente>,

    @InjectRepository(Ingrediente)
    private readonly ingredienteRepo: Repository<Ingrediente>,

    @InjectRepository(Receta)
    private readonly recetaRepo: Repository<Receta>,
  ) {}

  async create(dto: CreateRecetaIngredienteDto) {
    const ingrediente = await this.ingredienteRepo.findOne({
      where: { id: dto.id_ingrediente },
    });

    if (!ingrediente) {
      throw new NotFoundException('Ingrediente no encontrado');
    }

    if (!dto.cantidad_usada || dto.cantidad_usada <= 0) {
      throw new BadRequestException('Cantidad usada inválida');
    }

    const costo = +(
      dto.cantidad_usada * (ingrediente as any).precioKg
    ).toFixed(4);

    const nueva = this.repo.create({
      ...dto,
      costo_ingrediente: costo,
    });

    const guardado = await this.repo.save(nueva);

    // Actualizar el costo total de la receta
    await this.actualizarCostoTotal(dto.id_receta);

    return guardado;
  }

  async findAll() {
    return this.repo.find({
      relations: ['ingrediente', 'receta'],
    });
  }

  async findByReceta(id: number) {
    return this.repo.find({
      where: { id_receta: id },
      relations: ['ingrediente'],
    });
  }

  async remove(id_receta: number, id_ingrediente: number) {
    const existe = await this.repo.findOne({
      where: {
        id_receta,
        id_ingrediente,
      },
    });

    if (!existe) {
      throw new NotFoundException('Registro no encontrado');
    }

    await this.repo.remove(existe);

    // Actualizar el costo total de la receta
    await this.actualizarCostoTotal(id_receta);

    return { message: 'Ingrediente eliminado de la receta' };
  }

  async updateCantidad(id_receta: number, id_ingrediente: number, nuevaCantidad: number) {
    const registro = await this.repo.findOne({
      where: {
        id_receta,
        id_ingrediente,
      },
      relations: ['ingrediente'],
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    if (nuevaCantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor que cero');
    }

    const nuevoCosto = +(nuevaCantidad * (registro.ingrediente as any).precioKg).toFixed(4);

    registro.cantidad_usada = nuevaCantidad;
    registro.costo_ingrediente = nuevoCosto;

    await this.repo.save(registro);

    // Actualizar el costo total de la receta
    await this.actualizarCostoTotal(id_receta);

    return registro;
  }

  private async actualizarCostoTotal(id_receta: number) {
    const ingredientes = await this.repo.find({
      where: { id_receta },
    });

    const nuevoCostoTotal = ingredientes.reduce((total, ri) => {
      return total + (ri.costo_ingrediente || 0);
    }, 0);

    await this.recetaRepo.update(id_receta, {
      costoReceta: +nuevoCostoTotal.toFixed(2),
    });
  }
}
