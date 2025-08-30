import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Define global pipes
  app.useGlobalPipes(
    // Define valication pipe
    new ValidationPipe({
      whitelist: true, // strips properties that are not in DTO
      forbidNonWhitelisted: true, // throws error if unknown props are present
      transform: true, // auto-transform payloads to DTO class instances
    }),
  );

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
