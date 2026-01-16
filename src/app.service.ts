import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './recetas/entities/receta.entity';
import { Ingrediente } from './ingredientes/entities/ingrediente.entity';
import { Compra } from './compras/entities/compra.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Receta) private recetasRepo: Repository<Receta>,
    @InjectRepository(Ingrediente) private ingredientesRepo: Repository<Ingrediente>,
    @InjectRepository(Compra) private comprasRepo: Repository<Compra>,
  ) {}

  getHello(): string {
    return '🚀 API Gestor Gastronómico Funcionando Correctamente';
  }

  // 📊 Nueva función para el Dashboard
  async getDashboardStats() {
    // 1. Contadores básicos
    const totalRecetas = await this.recetasRepo.count();
    const totalIngredientes = await this.ingredientesRepo.count();
    
    // 2. Calcular valor total del inventario (Stock Actual * Precio Actual)
    // Esto te dice cuánto dinero tienes "parado" en la despensa
    const ingredientes = await this.ingredientesRepo.find();
    const valorInventario = ingredientes.reduce((total, ing) => {
      // Validamos que sean números para evitar NaN
      const peso = Number(ing.pesoKg) || 0;
      const precio = Number(ing.precioKg) || 0;
      return total + (peso * precio);
    }, 0);

    // 3. Obtener las últimas 5 compras para la tabla de resumen
    const ultimasCompras = await this.comprasRepo.find({
      order: { fecha_compra: 'DESC', id: 'DESC' },
      take: 5,
      relations: ['proveedor', 'ingrediente']
    });

    return {
      totalRecetas,
      totalIngredientes,
      valorInventario: Math.round(valorInventario * 100) / 100, // Redondear a 2 decimales
      ultimasCompras
    };
  }
}