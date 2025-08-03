import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { Compra } from './entities/compra.entity';
import { Proveedor } from '../proveedores/entities/proveedore.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Compra, Proveedor])],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [ComprasService]
})
export class ComprasModule {}
