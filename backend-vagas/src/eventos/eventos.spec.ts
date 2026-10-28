import { CandidaturaService } from '../candidatura/candidatura.service';
import { VagaService } from '../vaga/vaga.service';
import { PublicadorEventos } from './publicador-eventos.service';

const empresa10 = { id: 10, papel: 'empresa' as const, empresaId: 10 };
const aluno = { id: 7, papel: 'aluno' as const };

describe('Publicação de eventos (RabbitMQ simulado)', () => {
  let eventos: { publicar: jest.Mock };

  beforeEach(() => {
    eventos = { publicar: jest.fn() };
  });

  it('publica vaga.criada ao criar uma vaga', async () => {
    const prisma: any = {
      status: {
        findFirst: jest.fn().mockResolvedValue({ id: 1, nome: 'Pendente' }),
      },
      vaga: {
        create: jest.fn((args) => Promise.resolve({ id: 5, ...args.data })),
      },
    };
    const servico = new VagaService(
      prisma,
      eventos as unknown as PublicadorEventos,
    );
    await servico.criar({ titulo: 'Dev Back-end' } as any, empresa10);
    expect(eventos.publicar).toHaveBeenCalledWith(
      'vaga.criada',
      expect.objectContaining({ id: 5, empresaId: 10 }),
    );
  });

  it('publica candidatura.criada ao se candidatar', async () => {
    const prisma: any = {
      vaga: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          empresaId: 10,
          status: { nome: 'Ativa' },
        }),
      },
      candidatura: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn((args) => Promise.resolve({ id: 3, ...args.data })),
      },
    };
    const servico = new CandidaturaService(
      prisma,
      eventos as unknown as PublicadorEventos,
    );
    await servico.candidatar(1, aluno);
    expect(eventos.publicar).toHaveBeenCalledWith('candidatura.criada', {
      id: 3,
      vagaId: 1,
      alunoId: 7,
      empresaId: 10,
    });
  });

  it('não publica nada (e não quebra) se não houver RabbitMQ', () => {
    const publicador = new PublicadorEventos({ get: () => undefined } as any);
    publicador.onModuleInit();
    expect(() => publicador.publicar('vaga.criada', { id: 1 })).not.toThrow();
  });
});
