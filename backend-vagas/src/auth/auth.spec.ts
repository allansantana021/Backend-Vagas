import { Controller, Get, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Papeis } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UsuarioAtual } from './usuario-atual.decorator';
import { Usuario } from './usuario.interface';

const SEGREDO = 'segredo-de-teste';

@Controller('teste')
class ControllerDeTeste {
  @Get('livre')
  livre(@UsuarioAtual() u: Usuario) {
    return u;
  }

  @Get('empresa')
  @Papeis('empresa')
  soEmpresa() {
    return { ok: true };
  }

  @Get('admin')
  @Papeis('admin')
  soAdmin() {
    return { ok: true };
  }
}

describe('Autenticação e papéis (guards)', () => {
  let app: INestApplication;
  let jwt: JwtService;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        JwtModule.register({ secret: SEGREDO }),
      ],
      controllers: [ControllerDeTeste],
      providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();

    app = modulo.createNestApplication();
    await app.init();
    jwt = modulo.get(JwtService);
  });

  afterAll(() => app.close());

  const token = (payload: object) => jwt.sign(payload);
  const http = () => request(app.getHttpServer());

  it('401 sem token', () => http().get('/teste/livre').expect(401));

  it('401 com token de assinatura errada', () => {
    const falso = new JwtService({ secret: 'outro-segredo' }).sign({
      sub: 1,
      papel: 'admin',
    });
    return http()
      .get('/teste/livre')
      .set('Authorization', `Bearer ${falso}`)
      .expect(401);
  });

  it('401 com papel inexistente no token', () =>
    http()
      .get('/teste/livre')
      .set('Authorization', `Bearer ${token({ sub: 1, papel: 'hacker' })}`)
      .expect(401));

  it('200 e usuário montado a partir do token (empresa)', async () => {
    const res = await http()
      .get('/teste/livre')
      .set('Authorization', `Bearer ${token({ sub: 10, papel: 'empresa' })}`)
      .expect(200);
    expect(res.body).toEqual({ id: 10, papel: 'empresa', empresaId: 10 });
  });

  it('403 quando o papel não é permitido na rota', () =>
    http()
      .get('/teste/empresa')
      .set('Authorization', `Bearer ${token({ sub: 1, papel: 'aluno' })}`)
      .expect(403));

  it('200 quando o papel é permitido', () =>
    http()
      .get('/teste/admin')
      .set('Authorization', `Bearer ${token({ sub: 1, papel: 'admin' })}`)
      .expect(200));
});
