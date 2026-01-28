import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // 👈 Asegúrate de la ruta

@Controller('recetas')
@UseGuards(JwtAuthGuard) // 🔒 Protegemos todo el controlador
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  // 1. CREAR (Asignar al usuario)
  @Post()
  create(@Body() dto: CreateRecetaDto, @Request() req) {
    return this.recetasService.create(dto, req.user); 
  }

  // 2. LISTAR (Filtro por Rol)
  @Get()
  findAll(@Request() req) {
    return this.recetasService.findAll(req.user);
  }

  // 3. VER UNA (Validar propiedad)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.recetasService.findOne(id, req.user);
  }

  // 4. EDITAR (Solo dueño)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecetaDto, @Request() req) {
    return this.recetasService.update(id, dto, req.user);
  }

  // 5. BORRAR (Solo dueño)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.recetasService.remove(id, req.user);
  }

  // 6. CONVERTIR (Solo dueño)
  @Post(':id/convertir')
  convertirEnIngrediente(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.recetasService.convertirEnIngrediente(id, req.user);
  }
}