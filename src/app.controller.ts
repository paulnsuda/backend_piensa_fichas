import { Controller, Get, UseGuards, Req } from '@nestjs/common'; // 👈 Importamos Req
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  // 👇 RUTA PROTEGIDA (DASHBOARD)
  @UseGuards(JwtAuthGuard)
  @Get('dashboard') 
  getDashboard(@Req() req) { // 👈 Inyectamos la petición
    // Le pasamos el usuario (req.user) al servicio para que sepa qué filtrar
    return this.appService.getDashboardStats(req.user);
  }
}