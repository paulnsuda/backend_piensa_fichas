import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';
import { Proveedor } from './entities/proveedore.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor])],
  controllers: [ProveedoresController],
  providers: [ProveedoresService],
  exports: [ProveedoresService]
})
export class ProveedoresModule {}
