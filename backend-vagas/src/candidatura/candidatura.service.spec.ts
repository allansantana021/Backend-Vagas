import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Usuario } from '../auth/usuario.interface';
import { CandidaturaService } from './candidatura.service';

const aluno: Usuario = { id: 7, papel: 'aluno' };
const outroAluno: Usuario = { id: 8, papel: 'aluno' };
const empresa10: Usuario = { id: 10, papel: 'empresa', empresaId: 10 };
const empresa99: Usuario = { id: 99, papel: 'empresa', empresaId: 99 };

describe('CandidaturaService (regras de negócio, Prisma simulado)', () => {
  let prisma: any;
  let servico: CandidaturaService;

  beforeEach(() => {
    prisma = {
      vaga: { findUnique: jest.fn() },
      candidatura: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn((args) => Promise.resolve({ id: 1, ...args.data })),
        update: jest.fn((args) => Promise.resolve({ id: 1, ...args.data })),
        delete: jest.fn(),
      },
    };
    servico = new CandidaturaService(prisma);
  });

  const vaga = (statusNome: string) => ({
    id: 1,
    empresaId: 10,
    status: { nome: statusNome },
  });

  it('aluno se candidata a vaga Ativa', async () => {
    prisma.vaga.findUnique.mockResolvedValue(vaga('Ativa'));
    prisma.candidatura.findUnique.mockResolvedValue(null);
    const res = await servico.candidatar(1, aluno);
    expect(res).toMatchObject({ vagaId: 1, alunoId: 7 });
  });

  it('não permite candidatura em vaga que não está Ativa (400)', async () => {
    prisma.vaga.findUnique.mockResolvedValue(vaga('Pausada'));
    await expect(servico.candidatar(1, aluno)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('não permite candidatura duplicada (409)', async () => {
    prisma.vaga.findUnique.mockResolvedValue(vaga('Ativa'));
    prisma.candidatura.findUnique.mockResolvedValue({ id: 5 });
    await expect(servico.candidatar(1, aluno)).rejects.toThrow(
      ConflictException,
    );
  });

  it('vaga inexistente dá 404', async () => {
    prisma.vaga.findUnique.mockResolvedValue(null);
    await expect(servico.candidatar(1, aluno)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('aluno só cancela a própria candidatura (403)', async () => {
    prisma.candidatura.findUnique.mockResolvedValue({ id: 1, alunoId: 7 });
    await expect(servico.cancelar(1, outroAluno)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(servico.cancelar(1, aluno)).resolves.toBeDefined();
  });

  it('empresa dona vê candidatos; outra empresa não (403)', async () => {
    prisma.vaga.findUnique.mockResolvedValue({ id: 1, empresaId: 10 });
    await expect(servico.listarPorVaga(1, empresa10)).resolves.toEqual([]);
    await expect(servico.listarPorVaga(1, empresa99)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('empresa dona muda o status da candidatura', async () => {
    prisma.candidatura.findUnique.mockResolvedValue({
      id: 1,
      vaga: { id: 1, empresaId: 10 },
    });
    const res = await servico.atualizarStatus(
      1,
      { status: 'Aprovada' },
      empresa10,
    );
    expect(res.status).toBe('Aprovada');
  });
});
