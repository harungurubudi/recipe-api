import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/exception.filter';
import { ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.DailyRotateFile({
        level: 'info',
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ],
    format: winston.format.json(),
  });

  // Define global pipes
  app.useGlobalPipes(
    // Define valication pipe 
    new ValidationPipe({
      whitelist: true, // strips properties that are not in DTO
      forbidNonWhitelisted: true, // throws error if unknown props are present
      transform: true, // auto-transform payloads to DTO class instances
    }),
  );

  // Log HTTP requests
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.log('info', message.trim()),
    },
  }));

  // Define global filters
  app.useGlobalFilters(
    new AllExceptionsFilter()
  );

  const config = new DocumentBuilder()
    .setTitle('Recipe API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
