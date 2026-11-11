import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Usuario } from '../auth/usuario.interface';
import { VagaService } from './vaga.service';

const IDS_STATUS: Record<string, number> = {
  Pendente: 1,
  Ativa: 2,
  Pausada: 3,
  Encerrada: 4,
  Rejeitada: 5,
};

const aluno: Usuario = { id: 7, papel: 'aluno' };
const empresa10: Usuario = { id: 10, papel: 'empresa', empresaId: 10 };
const empresa99: Usuario = { id: 99, papel: 'empresa', empresaId: 99 };
const admin: Usuario = { id: 1, papel: 'admin' };

const vagaComStatus = (nome: string, empresaId = 10) => ({
  id: 1,
  titulo: 'Dev Back-end',
  empresaId,
  salarioMin: null,
  salarioMax: null,
  status: { id: IDS_STATUS[nome], nome },
});

describe('VagaService (regras de negócio, Prisma simulado)', () => {
  let prisma: any;
  let servico: VagaService;

  beforeEach(() => {
    prisma = {
      status: {
        findFirst: jest.fn(({ where }) =>
          Promise.resolve({ id: IDS_STATUS[where.nome], nome: where.nome }),
        ),
      },
      vaga: {
        create: jest.fn((args) => Promise.resolve({ id: 1, ...args.data })),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        delete: jest.fn(),
      },
      candidatura: { deleteMany: jest.fn() },
      requisito: { deleteMany: jest.fn() },
      habilidade: { deleteMany: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    servico = new VagaService(prisma);
  });

  const dto = { titulo: 'Dev Back-end', areaId: 1, nivelId: 2 };

  describe('criar', () => {
    it('empresa: dono vem do token e a vaga nasce Pendente', async () => {
      await servico.criar({ ...dto, empresaId: 555 } as any, empresa10);
      const dados = prisma.vaga.create.mock.calls[0][0].data;
      expect(dados.empresaId).toBe(10); // ignora o empresaId enviado no corpo
      expect(dados.recrutadorId).toBe(10);
      expect(dados.statusId).toBe(IDS_STATUS.Pendente);
    });

    it('admin precisa informar empresaId e recrutadorId', async () => {
      await expect(servico.criar(dto, admin)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejeita salarioMax menor que salarioMin', async () => {
      await expect(
        servico.criar(
          { ...dto, salarioMin: 6000, salarioMax: 1000 },
          empresa10,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listar / buscar', () => {
    it('aluno enxerga só vagas Ativas', async () => {
      await servico.listar({}, aluno);
      expect(prisma.vaga.findMany.mock.calls[0][0].where.statusId).toBe(
        IDS_STATUS.Ativa,
      );
    });

    it('admin pode filtrar por qualquer status', async () => {
      await servico.listar({ statusId: 1 }, admin);
      expect(prisma.vaga.findMany.mock.calls[0][0].where.statusId).toBe(1);
    });

    it('aluno não consegue abrir vaga que não está Ativa (404)', async () => {
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Pausada'));
      await expect(servico.buscarPorId(1, aluno)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('dono consegue abrir a própria vaga mesmo Pendente', async () => {
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Pendente'));
      await expect(servico.buscarPorId(1, empresa10)).resolves.toBeDefined();
    });
  });

  describe('moderação e fluxo de status', () => {
    it('admin aprova vaga Pendente -> Ativa', async () => {
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Pendente'));
      await servico.aprovar(1, admin);
      expect(prisma.vaga.update.mock.calls[0][0].data.statusId).toBe(
        IDS_STATUS.Ativa,
      );
    });

    it('não aprova vaga que não está Pendente (400)', async () => {
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Ativa'));
      await expect(servico.aprovar(1, admin)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('empresa dona pausa vaga Ativa', async () => {
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Ativa'));
      await servico.pausar(1, empresa10);
      expect(prisma.vaga.update.mock.calls[0][0].data.statusId).toBe(
        IDS_STATUS.Pausada,
      );
    });

    it('empresa de outra empresa não pode pausar (403)', async () => {
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Ativa'));
      await expect(servico.pausar(1, empresa99)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('encerra vaga Pausada, mas não vaga já Encerrada', async () => {
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Pausada'));
      await expect(servico.encerrar(1, empresa10)).resolves.toBeDefined();
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Encerrada'));
      await expect(servico.encerrar(1, empresa10)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('atualizar / remover', () => {
    it('empresa de outra empresa não edita (403)', async () => {
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Ativa'));
      await expect(
        servico.atualizar(1, { titulo: 'x' }, empresa99),
      ).rejects.toThrow(ForbiddenException);
    });

    it('remover apaga dependentes e a vaga numa transação', async () => {
      prisma.vaga.findUnique.mockResolvedValue(vagaComStatus('Ativa'));
      await servico.remover(1, empresa10);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.candidatura.deleteMany).toHaveBeenCalledWith({
        where: { vagaId: 1 },
      });
    });

    it('remover vaga inexistente dá 404', async () => {
      prisma.vaga.findUnique.mockResolvedValue(null);
      await expect(servico.remover(1, admin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
