import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { FiltroExcecaoPrisma } from './common/filtro-excecao-prisma';
import { PrismaService } from './prisma/prisma.service';

// Sobe a aplicação inteira (todos os módulos e guards) com o Prisma simulado.
describe('Aplicação completa (rotas, papéis e validação)', () => {
  let app: INestApplication;
  const SEGREDO = 'segredo-de-teste-app';

  const prismaSimulado = {
    status: {
      findFirst: jest.fn().mockResolvedValue({ id: 1, nome: 'Pendente' }),
    },
    vaga: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    requisito: { findMany: jest.fn().mockResolvedValue([]) },
    habilidade: { findMany: jest.fn().mockResolvedValue([]) },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = SEGREDO;
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaSimulado)
      .compile();

    app = modulo.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new FiltroExcecaoPrisma());
    await app.init();
  });

  afterAll(() => app.close());

  const token = (papel: string, id = 1) =>
    new JwtService({ secret: SEGREDO }).sign({ sub: id, papel });
  const http = () => request(app.getHttpServer());
  const com = (papel: string, id = 1) => ({
    Authorization: `Bearer ${token(papel, id)}`,
  });

  it('rotas protegidas exigem token (401)', async () => {
    await http().get('/vagas').expect(401);
    await http().get('/areas').expect(401);
  });

  it('GET /vagas/minhas não é capturada por /vagas/:id e aceita filtros opcionais', async () => {
    await http().get('/vagas/minhas').set(com('empresa', 10)).expect(200);
    await http()
      .get('/vagas/minhas?statusId=2&q=dev')
      .set(com('empresa', 10))
      .expect(200);
    await http().get('/vagas/minhas').set(com('aluno')).expect(403);
  });

  it('listagens com filtro numérico opcional funcionam sem o filtro', async () => {
    await http().get('/requisitos').set(com('aluno')).expect(200);
    await http().get('/habilidades?vagaId=1').set(com('aluno')).expect(200);
    await http().get('/requisitos?vagaId=abc').set(com('aluno')).expect(400);
  });

  it('GET /vagas/moderacao: admin 200, aluno 403', async () => {
    await http().get('/vagas/moderacao').set(com('admin')).expect(200);
    await http().get('/vagas/moderacao').set(com('aluno')).expect(403);
  });

  it('aluno não cria vaga (403) e empresa com corpo inválido recebe 400', async () => {
    await http().post('/vagas').set(com('aluno')).send({}).expect(403);
    await http().post('/vagas').set(com('empresa', 10)).send({}).expect(400);
    await http()
      .post('/vagas')
      .set(com('empresa', 10))
      .send({ titulo: 'x', areaId: 1, nivelId: 1, modalidade: 'Qualquer' })
      .expect(400);
  });

  it('só admin altera tabelas de apoio (área)', async () => {
    await http()
      .post('/areas')
      .set(com('empresa', 10))
      .send({ nome: 'X' })
      .expect(403);
  });

  it('só aluno se candidata', async () => {
    await http()
      .post('/vagas/1/candidaturas')
      .set(com('empresa', 10))
      .expect(403);
  });

  it('GET /vagas/abc retorna 400 (id inválido)', async () => {
    await http().get('/vagas/abc').set(com('admin')).expect(400);
  });

  it('documentação Swagger lista as rotas do fluxo de vagas e candidaturas', () => {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        '/vagas',
        '/vagas/minhas',
        '/vagas/moderacao',
        '/vagas/{id}/aprovar',
        '/vagas/{id}/pausar',
        '/vagas/{vagaId}/candidaturas',
        '/candidaturas/minhas',
        '/requisitos',
        '/habilidades',
      ]),
    );
  });
});
