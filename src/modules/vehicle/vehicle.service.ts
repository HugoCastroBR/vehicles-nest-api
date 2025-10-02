import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehicleEventsPublisher } from './messaging/vehicle-events.publisher';

@Injectable()
export class VehicleService {
  constructor(
    private prisma: PrismaService,
    private publisher: VehicleEventsPublisher,
  ) { }

  async createVehicle(data: CreateVehicleDto) {
    const created = await this.prisma.vehicle.create({ data });
    // Produz mensagem assíncrona
    this.publisher.emitCreated({
      id: created.id,
      placa: created.placa,
      chassi: created.chassi,
      renavam: created.renavam,
      modelo: created.modelo,
      marca: created.marca,
      ano: created.ano,
    }).toPromise?.().catch(() => void 0); // fire and forget
    return created;
  }

  getVehicles() {
    return this.prisma.vehicle.findMany();
  }

  async getVehicleById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Veículo não encontrado.');
    return vehicle;
  }

  async updateVehicle(data: Partial<CreateVehicleDto>, id: string) {
    const updated = await this.prisma.vehicle.update({ where: { id }, data });
    this.publisher.emitUpdated({
      id: updated.id,
      placa: updated.placa,
      chassi: updated.chassi,
      renavam: updated.renavam,
      modelo: updated.modelo,
      marca: updated.marca,
      ano: updated.ano,
    }).toPromise?.().catch(() => void 0);
    return updated;
  }

  async deleteVehicle(id: string) {
    const deleted = await this.prisma.vehicle.delete({ where: { id } });
    this.publisher.emitDeleted({ id: deleted.id }).toPromise?.().catch(() => void 0);
    return deleted;
  }
}