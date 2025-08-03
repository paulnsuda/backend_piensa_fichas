import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedore.entity';
import { CreateProveedorDto } from './dto/create-proveedore.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedorRepo: Repository<Proveedor>
  ) {}

  create(dto: CreateProveedorDto) {
    const nuevo = this.proveedorRepo.create(dto);
    return this.proveedorRepo.save(nuevo);
  }

  findAll() {
    return this.proveedorRepo.find();
  }
}
