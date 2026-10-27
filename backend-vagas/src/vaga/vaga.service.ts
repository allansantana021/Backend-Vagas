import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Usuario } from '../auth/usuario.interface';
import { exigirDonoOuAdmin, podeGerenciarVaga } from '../common/permissoes';
import { PrismaService } from '../prisma/prisma.service';
import { STATUS } from './constantes';
import { AtualizarVagaDto } from './dto/atualizar-vaga.dto';
import { CriarVagaDto } from './dto/criar-vaga.dto';
import { FiltrarVagaDto } from './dto/filtrar-vaga.dto';

const INCLUIR_BASE = { area: true, nivel: true, status: true } as const;

@Injectable()
export class VagaService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- utilidades ----------

  private validarSalario(min?: unknown, max?: unknown) {
    if (min != null && max != null && Number(max) < Number(min)) {
      throw new BadRequestException(
        'salarioMax não pode ser menor que salarioMin',
      );
    }
  }

  private async idDoStatus(nome: string): Promise<number> {
    const status = await this.prisma.status.findFirst({ where: { nome } });
    if (!status) {
      throw new InternalServerErrorException(
        `Status "${nome}" não cadastrado. Rode "npm run seed".`,
      );
    }
    return status.id;
  }

  private async buscarOuFalhar(id: number) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id },
      include: INCLUIR_BASE,
    });
    if (!vaga) throw new NotFoundException(`Vaga ${id} não encontrada`);
    return vaga;
  }

  // ---------- CRUD ----------

  async criar(dto: CriarVagaDto, usuario: Usuario) {
    this.validarSalario(dto.salarioMin, dto.salarioMax);

    let empresaId: number;
    let recrutadorId: number;
    if (usuario.papel === 'empresa') {
      // A empresa só cria vaga para si mesma: o dono vem do token
      empresaId = usuario.empresaId as number;
      recrutadorId = dto.recrutadorId ?? usuario.id;
    } else {
      if (dto.empresaId == null || dto.recrutadorId == null) {
        throw new BadRequestException(
          'Admin deve informar empresaId e recrutadorId',
        );
      }
      empresaId = dto.empresaId;
      recrutadorId = dto.recrutadorId;
    }

    const { empresaId: _e, recrutadorId: _r, ...dados } = dto;
    return this.prisma.vaga.create({
      data: {
        ...dados,
        empresaId,
        recrutadorId,
        // Toda vaga nasce "Pendente" e só aparece aos alunos depois de aprovada
        statusId: await this.idDoStatus(STATUS.PENDENTE),
      },
      include: INCLUIR_BASE,
    });
  }

  // Catálogo: alunos/empresas veem só vagas Ativas; admin vê todas
  async listar(filtros: FiltrarVagaDto, usuario: Usuario) {
    const { q, cidade, statusId, ...exatos } = filtros;
    const where: Prisma.VagaWhereInput = {
      ...exatos,
      ...(q ? { titulo: { contains: q } } : {}),
      ...(cidade ? { cidade: { contains: cidade } } : {}),
    };
    if (usuario.papel === 'admin') {
      if (statusId) where.statusId = statusId;
    } else {
      where.statusId = await this.idDoStatus(STATUS.ATIVA);
    }
    return this.prisma.vaga.findMany({
      where,
      include: INCLUIR_BASE,
      orderBy: { publicadaEm: 'desc' },
    });
  }

  // Tela "Minhas vagas" da empresa (com número de candidatos)
  minhas(usuario: Usuario, statusId?: number, q?: string) {
    return this.prisma.vaga.findMany({
      where: {
        empresaId: usuario.empresaId,
        ...(statusId ? { statusId } : {}),
        ...(q ? { titulo: { contains: q } } : {}),
      },
      include: { ...INCLUIR_BASE, _count: { select: { candidaturas: true } } },
      orderBy: { publicadaEm: 'desc' },
    });
  }

  // Tela "Moderação" do admin: por padrão, vagas Pendentes
  async moderacao(statusId?: number) {
    return this.prisma.vaga.findMany({
      where: { statusId: statusId ?? (await this.idDoStatus(STATUS.PENDENTE)) },
      include: INCLUIR_BASE,
      orderBy: { publicadaEm: 'asc' },
    });
  }

  async buscarPorId(id: number, usuario: Usuario) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id },
      include: { ...INCLUIR_BASE, requisitos: true, habilidades: true },
    });
    // Vagas que não estão Ativas só aparecem para o dono e para o admin
    const visivel =
      vaga &&
      (podeGerenciarVaga(usuario, vaga) || vaga.status.nome === STATUS.ATIVA);
    if (!vaga || !visivel)
      throw new NotFoundException(`Vaga ${id} não encontrada`);
    return vaga;
  }

  async atualizar(id: number, dto: AtualizarVagaDto, usuario: Usuario) {
    const atual = await this.buscarOuFalhar(id);
    exigirDonoOuAdmin(usuario, atual);
    this.validarSalario(
      dto.salarioMin ?? atual.salarioMin,
      dto.salarioMax ?? atual.salarioMax,
    );
    return this.prisma.vaga.update({
      where: { id },
      data: dto,
      include: INCLUIR_BASE,
    });
  }

  async remover(id: number, usuario: Usuario) {
    const vaga = await this.buscarOuFalhar(id);
    exigirDonoOuAdmin(usuario, vaga);
    // As FKs do modelo são NO ACTION: remove os dependentes antes, numa transação
    await this.prisma.$transaction([
      this.prisma.candidatura.deleteMany({ where: { vagaId: id } }),
      this.prisma.requisito.deleteMany({ where: { vagaId: id } }),
      this.prisma.habilidade.deleteMany({ where: { vagaId: id } }),
      this.prisma.vaga.delete({ where: { id } }),
    ]);
    return { mensagem: `Vaga ${id} removida com sucesso` };
  }

  // ---------- fluxo de status ----------

  private async mudarStatus(
    id: number,
    usuario: Usuario,
    permitidosDe: string[],
    para: string,
  ) {
    const vaga = await this.buscarOuFalhar(id);
    exigirDonoOuAdmin(usuario, vaga);
    const atual = vaga.status.nome ?? '';
    if (!permitidosDe.includes(atual)) {
      throw new BadRequestException(
        `Não é possível mudar a vaga de "${atual}" para "${para}"`,
      );
    }
    return this.prisma.vaga.update({
      where: { id },
      data: { statusId: await this.idDoStatus(para) },
      include: INCLUIR_BASE,
    });
  }

  // Moderação (somente admin, garantido pelo @Papeis no controller)
  aprovar(id: number, usuario: Usuario) {
    return this.mudarStatus(id, usuario, [STATUS.PENDENTE], STATUS.ATIVA);
  }

  rejeitar(id: number, usuario: Usuario) {
    return this.mudarStatus(id, usuario, [STATUS.PENDENTE], STATUS.REJEITADA);
  }

  // Gestão pela empresa dona (ou admin)
  pausar(id: number, usuario: Usuario) {
    return this.mudarStatus(id, usuario, [STATUS.ATIVA], STATUS.PAUSADA);
  }

  reativar(id: number, usuario: Usuario) {
    return this.mudarStatus(id, usuario, [STATUS.PAUSADA], STATUS.ATIVA);
  }

  encerrar(id: number, usuario: Usuario) {
    return this.mudarStatus(
      id,
      usuario,
      [STATUS.ATIVA, STATUS.PAUSADA],
      STATUS.ENCERRADA,
    );
  }
}
