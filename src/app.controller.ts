import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Ruta pública para probar que el server vive
  @Get()
  getHello() {
    return this.appService.getHello();
  }

  // 👇 Ruta protegida para el Home del Frontend
  @UseGuards(JwtAuthGuard)
  @Get('dashboard') 
  getDashboard() {
    return this.appService.getDashboardStats();
  }
}