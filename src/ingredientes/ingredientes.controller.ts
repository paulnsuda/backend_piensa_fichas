import { Controller, Post, Get, Body } from '@nestjs/common';
import { IngredientesService } from './ingredientes.service';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { Public } from '../auth/decorators/public.decorator'; // ✅ Asegúrate de que existe este decorador

@Controller('ingredientes')
export class IngredientesController {
  constructor(private readonly ingredientesService: IngredientesService) {}

  @Post()
  create(@Body() dto: CreateIngredienteDto) {
    return this.ingredientesService.create(dto);
  }

  @Public() // ✅ Permite acceder sin token a la lista de ingredientes
  @Get()
  findAll() {
    return this.ingredientesService.findAll();
  }
}
