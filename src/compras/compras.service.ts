import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { CreateCompraDto } from './dto/create-compra.dto';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>
  ) {}

  async create(dto: CreateCompraDto) {
    const compra = this.compraRepository.create({
      ...dto,
      proveedor: { id: dto.id_proveedor },
    });
    return this.compraRepository.save(compra);
  }

  findAll() {
    return this.compraRepository.find();
  }

  findOne(id: number) {
    return this.compraRepository.findOne({ where: { id } });
  }
}
