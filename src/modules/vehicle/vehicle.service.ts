import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) { }

  createVehicle(data: CreateVehicleDto) {
    return this.prisma.vehicle.create({ data });
  }

  getVehicles() {
    return this.prisma.vehicle.findMany();
  }

  async getVehicleById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }
    return vehicle;
  }

  updateVehicle(data: Partial<CreateVehicleDto>, id: string) {
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  deleteVehicle(id: string) {
    return this.prisma.vehicle.delete({ where: { id } });
  }
}