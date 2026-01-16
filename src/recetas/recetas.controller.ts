import {Controller,Get,Post,Body,Param,Patch,Delete,ParseIntPipe,UseGuards,Request} from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('recetas')
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @UseGuards(JwtAuthGuard) // 🔒 Solo usuarios logueados
  @Post()
  create(@Body() dto: CreateRecetaDto, @Request() req) {
    // req.user viene del JwtStrategy (contiene id, email, rol)
    return this.recetasService.create(dto, req.user); 
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    // Pasamos el usuario para filtrar:
    // Si es ALUMNO -> ve solo sus recetas.
    // Si es PROFESOR -> ve todas.
    return this.recetasService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recetasService.findOne(id);
  }

  @Get('con-ingredientes')
  findAllConIngredientes() {
    return this.recetasService.findAllConIngredientes();
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecetaDto) {
    return this.recetasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recetasService.remove(id);
  }
}
