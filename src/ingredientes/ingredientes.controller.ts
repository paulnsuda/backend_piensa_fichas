import { Controller, Post, Get, Body, Param, Put } from '@nestjs/common';
import { IngredientesService } from './ingredientes.service';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
import { Public } from '../auth/decorators/public.decorator'; // ✅ Decorador para rutas sin autenticación
import { Delete } from '@nestjs/common/decorators/http/request-mapping.decorator';

@Controller('ingredientes')
export class IngredientesController {
  constructor(private readonly ingredientesService: IngredientesService) {}

  // ✅ Crear un ingrediente (ahora pública para desarrollo)
  @Public()
  @Post()
  create(@Body() createIngredienteDto: CreateIngredienteDto) {
    return this.ingredientesService.create(createIngredienteDto);
  }

  // ✅ Obtener todos los ingredientes (pública)
  @Public()
  @Get()
  findAll() {
    return this.ingredientesService.findAll();
  }

  // ✅ Actualizar un ingrediente por ID (opcional: podrías hacerlo público también si lo necesitas)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIngredienteDto) {
    return this.ingredientesService.update(+id, dto); // Convertir a número
  }
  // ✅ Eliminar ingrediente por ID (puedes hacerla pública si deseas)
@Public()
@Delete(':id')
remove(@Param('id') id: string) {
  return this.ingredientesService.remove(+id);
}

}
