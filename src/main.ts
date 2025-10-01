import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './core/common/filters/prisma-excpetion.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: true, credentials: true });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const details = errors.map((e) => ({
          field: e.property,
          constraints: e.constraints,
        }));
        return new BadRequestException({
          message: 'Dados inválidos.',
          details,
        });
      },
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Vehicle API Boilerplate')
    .setDescription('The Vehicle API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    useGlobalPrefix: false,
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  const url = await app.getUrl();
  console.log(`API: ${url}/api`);
  console.log(`Swagger: ${url}/docs`);
}
bootstrap();