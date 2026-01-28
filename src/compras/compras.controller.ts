import { Controller, Post, Get, Param, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // 👈 Asegúrate de la ruta

@Controller('compras')
@UseGuards(JwtAuthGuard) // 🔒 Protegemos todo el módulo
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  create(@Body() dto: CreateCompraDto, @Req() req) {
    // Pasamos el usuario para registrar quién compró
    return this.comprasService.create(dto, req.user);
  }

  @Get()
  findAll(@Req() req) {
    // Pasamos el usuario para filtrar su historial
    return this.comprasService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.comprasService.findOne(+id, req.user);
  }
  
  // Opcional: Eliminar compra (restar stock)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
      return this.comprasService.remove(+id, req.user);
  }
}