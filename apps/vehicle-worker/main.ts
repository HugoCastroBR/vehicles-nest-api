import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { VehicleWorkerModule } from './vehicle.worker.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    VehicleWorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_URL || 'amqp://guest:guest@localhost:5672'],
        queue: process.env.RMQ_QUEUE || 'vehicles.events',
        queueOptions: { durable: true },
        noAck: false,
        prefetchCount: 10,
      },
    },
  );
  await app.listen();
  // eslint-disable-next-line no-console
  console.log('Vehicle Worker listening on RabbitMQ queue');
}
bootstrap();