import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/services/prisma/prisma.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    VehicleModule
  ],
})
export class AppModule { }
