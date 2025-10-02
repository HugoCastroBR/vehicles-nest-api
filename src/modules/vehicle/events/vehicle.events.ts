export const VEHICLE_EVENTS = {
  CREATED: 'vehicle.created',
  UPDATED: 'vehicle.updated',
  DELETED: 'vehicle.deleted',
} as const;

export type VehicleEventType = typeof VEHICLE_EVENTS[keyof typeof VEHICLE_EVENTS];

export interface VehicleEventPayload {
  id: string;
  placa: string;
  chassi: string;
  renavam: string;
  modelo: string;
  marca: string;
  ano: number;
  occurredAt: string;
  eventId: string;
  source: 'api';
}