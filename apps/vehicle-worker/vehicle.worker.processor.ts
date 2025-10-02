import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import * as vehicleEvents from 'src/modules/vehicle/events/vehicle.events';

export class VehicleWorkerProcessor {
  @EventPattern(vehicleEvents.VEHICLE_EVENTS.CREATED)
  async handleVehicleCreated(@Payload() data: vehicleEvents.VehicleEventPayload, @Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();

    try {

      channel.ack(originalMsg);
    } catch (e) {
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern(vehicleEvents.VEHICLE_EVENTS.UPDATED)
  async handleVehicleUpdated(@Payload() data: vehicleEvents.VehicleEventPayload, @Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();
    try {
      channel.ack(originalMsg);
    } catch {
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern(vehicleEvents.VEHICLE_EVENTS.DELETED)
  async handleVehicleDeleted(@Payload() data: { id: string } & Partial<vehicleEvents.VehicleEventPayload>, @Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();
    try {
      channel.ack(originalMsg);
    } catch {
      channel.nack(originalMsg, false, false);
    }
  }
}