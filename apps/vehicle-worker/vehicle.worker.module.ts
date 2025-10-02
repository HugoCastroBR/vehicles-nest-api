import { Module } from '@nestjs/common';
import { VehicleWorkerProcessor } from './vehicle.worker.processor';

@Module({
  providers: [VehicleWorkerProcessor],
})
export class VehicleWorkerModule { }