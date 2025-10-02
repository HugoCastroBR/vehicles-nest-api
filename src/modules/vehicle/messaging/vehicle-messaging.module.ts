import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { VehicleEventsPublisher } from './vehicle-events.publisher';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'VEHICLE_RMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL as string],
          queue: process.env.RMQ_QUEUE as string,
          queueOptions: { durable: true },
          noAck: true,
          prefetchCount: 1,
          replyQueue: 'amq.rabbitmq.reply-to',
        },
      },
    ]),
  ],
  providers: [VehicleEventsPublisher],
  exports: [VehicleEventsPublisher],
})
export class VehicleMessagingModule { }