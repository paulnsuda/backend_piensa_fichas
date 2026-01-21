import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // 👈 Asegúrate que la ruta sea correcta

@Controller('recetas')
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  // ==================================================
  // 1. CREAR (Protegido 🔒)
  // ==================================================
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateRecetaDto, @Request() req) {
    // req.user tiene el ID y el ROL del token
    return this.recetasService.create(dto, req.user); 
  }

  // ==================================================
  // 2. LISTAR (Protegido y con Filtro de Roles 🔒)
  // ==================================================
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    // El servicio decide: Si es Profe ve todo, si es Alumno ve lo suyo
    return this.recetasService.findAll(req.user);
  }

  // ==================================================
  // 3. VER UNA (Pública o Privada?)
  // ==================================================
  // Si quieres que cualquiera pueda ver el detalle (para compartir), déjalo así.
  // Si quieres que solo usuarios registrados vean, agrega @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recetasService.findOne(id);
  }

  // Rutas auxiliares
  @Get('con-ingredientes')
  findAllConIngredientes() {
    return this.recetasService.findAllConIngredientes();
  }

  // ==================================================
  // 4. EDITAR (⚠️ ESTABA ABIERTO, AHORA PROTEGIDO 🔒)
  // ==================================================
  @UseGuards(JwtAuthGuard) // 👈 ¡FALTABA ESTO!
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecetaDto) {
    return this.recetasService.update(id, dto);
  }

  // ==================================================
  // 5. BORRAR (⚠️ ESTABA ABIERTO, AHORA PROTEGIDO 🔒)
  // ==================================================
  @UseGuards(JwtAuthGuard) // 👈 ¡FALTABA ESTO!
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recetasService.remove(id);
  }
}
