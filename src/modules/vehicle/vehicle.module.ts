import { Module } from '@nestjs/common';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { VehicleMessagingModule } from './messaging/vehicle-messaging.module';

@Module({
  imports: [VehicleMessagingModule],
  controllers: [VehicleController],
  providers: [VehicleService, PrismaService],
  exports: [VehicleService],
})
export class VehicleModule { }