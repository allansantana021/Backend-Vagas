import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Usuario } from '../auth/usuario.interface';
import { exigirDonoOuAdmin } from '../common/permissoes';
import { PrismaService } from '../prisma/prisma.service';
import { STATUS } from '../vaga/constantes';
import { AtualizarStatusCandidaturaDto } from './dto/atualizar-status-candidatura.dto';

@Injectable()
export class CandidaturaService {
  constructor(private readonly prisma: PrismaService) {}

  // Aluno se candidata a uma vaga Ativa (uma candidatura por vaga)
  async candidatar(vagaId: number, aluno: Usuario) {
    const vaga = await this.prisma.vaga.findUnique({
      where: { id: vagaId },
      include: { status: true },
    });
    if (!vaga) throw new NotFoundException(`Vaga ${vagaId} não encontrada`);
    if (vaga.status.nome !== STATUS.ATIVA) {
      throw new BadRequestException('Esta vaga não está aberta a candidaturas');
    }

    const existente = await this.prisma.candidatura.findUnique({
      where: { vagaId_alunoId: { vagaId, alunoId: aluno.id } },
    });
    if (existente) {
      throw new ConflictException('Você já se candidatou a esta vaga');
    }
    return this.prisma.candidatura.create({
      data: { vagaId, alunoId: aluno.id },
    });
  }

  // Tela "Minhas candidaturas" do aluno
  minhas(aluno: Usuario) {
    return this.prisma.candidatura.findMany({
      where: { alunoId: aluno.id },
      include: { vaga: { include: { area: true, nivel: true, status: true } } },
      orderBy: { criadaEm: 'desc' },
    });
  }

  async cancelar(id: number, usuario: Usuario) {
    const candidatura = await this.prisma.candidatura.findUnique({
      where: { id },
    });
    if (!candidatura)
      throw new NotFoundException(`Candidatura ${id} não encontrada`);
    if (usuario.papel !== 'admin' && candidatura.alunoId !== usuario.id) {
      throw new ForbiddenException(
        'Você só pode cancelar a sua própria candidatura',
      );
    }
    await this.prisma.candidatura.delete({ where: { id } });
    return { mensagem: `Candidatura ${id} cancelada` };
  }

  // Tela "Candidatos" da empresa
  async listarPorVaga(vagaId: number, usuario: Usuario) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id: vagaId } });
    if (!vaga) throw new NotFoundException(`Vaga ${vagaId} não encontrada`);
    exigirDonoOuAdmin(usuario, vaga);
    return this.prisma.candidatura.findMany({
      where: { vagaId },
      orderBy: { criadaEm: 'asc' },
    });
  }

  async atualizarStatus(
    id: number,
    dto: AtualizarStatusCandidaturaDto,
    usuario: Usuario,
  ) {
    const candidatura = await this.prisma.candidatura.findUnique({
      where: { id },
      include: { vaga: true },
    });
    if (!candidatura)
      throw new NotFoundException(`Candidatura ${id} não encontrada`);
    exigirDonoOuAdmin(usuario, candidatura.vaga);
    return this.prisma.candidatura.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
