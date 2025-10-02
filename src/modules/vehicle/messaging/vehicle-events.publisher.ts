import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { VEHICLE_EVENTS, VehicleEventPayload } from '../events/vehicle.events';

@Injectable()
export class VehicleEventsPublisher {
  constructor(
    @Inject('VEHICLE_RMQ_CLIENT') private readonly client: ClientProxy,
  ) { }

  emitCreated(payload: Omit<VehicleEventPayload, 'eventId' | 'occurredAt' | 'source'>) {
    const message: VehicleEventPayload = {
      ...payload,
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      source: 'api',
    };
    return this.client.emit(VEHICLE_EVENTS.CREATED, message);
  }

  emitUpdated(payload: Omit<VehicleEventPayload, 'eventId' | 'occurredAt' | 'source'>) {
    const message: VehicleEventPayload = {
      ...payload,
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      source: 'api',
    };
    return this.client.emit(VEHICLE_EVENTS.UPDATED, message);
  }

  emitDeleted(payload: Pick<VehicleEventPayload, 'id'>) {
    const message = {
      ...payload,
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      source: 'api',
    };
    return this.client.emit(VEHICLE_EVENTS.DELETED, message);
  }
}