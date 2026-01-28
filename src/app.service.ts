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

  // 📊 DASHBOARD FILTRADO POR USUARIO
  async getDashboardStats(user: any) {
    
    // 1. DEFINIR EL FILTRO DE SEGURIDAD
    // Si es Profesor, el filtro es vacio (trae todo).
    // Si es Alumno, el filtro busca por su ID.
    const filtro = (user.rol === 'profesor' || user.rol === 'admin') 
        ? {} 
        : { usuario: { id: user.id } };

    // 2. CONTADORES (Aplicando el filtro)
    // .count({ where: filtro }) solo cuenta las filas que coinciden
    const totalRecetas = await this.recetasRepo.count({ where: filtro });
    const totalIngredientes = await this.ingredientesRepo.count({ where: filtro });
    
    // 3. VALOR INVENTARIO (Solo suma lo que te pertenece)
    const ingredientes = await this.ingredientesRepo.find({ where: filtro });
    
    const valorInventario = ingredientes.reduce((total, ing) => {
      const peso = Number(ing.pesoKg) || 0;
      const precio = Number(ing.precioKg) || 0;
      return total + (peso * precio);
    }, 0);

    // 4. ÚLTIMAS COMPRAS (Solo muestra TU historial)
    const ultimasCompras = await this.comprasRepo.find({
      where: filtro, // 👈 Importante filtrar aquí también
      order: { fecha_compra: 'DESC', id: 'DESC' },
      take: 5,
      relations: ['proveedor', 'ingrediente']
    });

    return {
      totalRecetas,
      totalIngredientes,
      valorInventario: Math.round(valorInventario * 100) / 100,
      ultimasCompras
    };
  }
}