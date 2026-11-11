import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FiltroExcecaoPrisma } from './common/filtro-excecao-prisma';

async function iniciar() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new FiltroExcecaoPrisma());

  const configuracao = new DocumentBuilder()
    .setTitle('Microsserviço de Vagas')
    .setDescription(
      'CRUD de vagas, áreas, níveis, status, requisitos e habilidades',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api',
    app,
    SwaggerModule.createDocument(app, configuracao),
  );

  const porta = process.env.PORT ?? 3000;
  await app.listen(porta);
  console.log(`API rodando em http://localhost:${porta}`);
  console.log(`Swagger em http://localhost:${porta}/api`);
}
iniciar();
