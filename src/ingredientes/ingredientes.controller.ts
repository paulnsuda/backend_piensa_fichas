import { Controller, Post, Get, Body, Param, Put, Delete, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { IngredientesService } from './ingredientes.service';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
// Asegúrate de importar tu Guard de autenticación (el nombre puede variar según tu proyecto)
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 

@Controller('ingredientes')
@UseGuards(JwtAuthGuard) // 🔒 BLOQUEAMOS TODO EL CONTROLADOR: Solo usuarios logueados entran
export class IngredientesController {
  constructor(private readonly ingredientesService: IngredientesService) {}

  // ✅ CREAR (Se guarda con el ID del usuario)
  @Post()
  create(@Body() createIngredienteDto: CreateIngredienteDto, @Req() req) {
    // req.user viene del Token JWT
    return this.ingredientesService.create(createIngredienteDto, req.user);
  }

  // ✅ OBTENER (Aplica el filtro: Alumno solo ve lo suyo)
  @Get()
  findAll(@Req() req) {
    return this.ingredientesService.findAll(req.user);
  }

  // ✅ ACTUALIZAR (Solo si es tuyo o eres profesor)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIngredienteDto, @Req() req) {
    return this.ingredientesService.update(+id, dto, req.user);
  }

  // ✅ ELIMINAR (Solo si es tuyo o eres profesor)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.ingredientesService.remove(+id, req.user);
  }
}