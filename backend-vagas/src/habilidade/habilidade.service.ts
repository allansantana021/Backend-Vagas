import { Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from '../auth/usuario.interface';
import { exigirDonoOuAdmin } from '../common/permissoes';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarHabilidadeDto } from './dto/atualizar-habilidade.dto';
import { CriarHabilidadeDto } from './dto/criar-habilidade.dto';

@Injectable()
export class HabilidadeService {
  constructor(private readonly prisma: PrismaService) {}

  private async vagaDoUsuario(vagaId: number, usuario: Usuario) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id: vagaId } });
    if (!vaga) throw new NotFoundException(`Vaga ${vagaId} não encontrada`);
    exigirDonoOuAdmin(usuario, vaga);
  }

  async criar(dto: CriarHabilidadeDto, usuario: Usuario) {
    await this.vagaDoUsuario(dto.vagaId, usuario);
    return this.prisma.habilidade.create({ data: dto });
  }

  listar(vagaId?: number) {
    return this.prisma.habilidade.findMany({
      where: vagaId ? { vagaId } : undefined,
      orderBy: { id: 'asc' },
    });
  }

  async buscarPorId(id: number) {
    const registro = await this.prisma.habilidade.findUnique({ where: { id } });
    if (!registro)
      throw new NotFoundException(`Habilidade ${id} não encontrado(a)`);
    return registro;
  }

  async atualizar(id: number, dto: AtualizarHabilidadeDto, usuario: Usuario) {
    const registro = await this.buscarPorId(id);
    await this.vagaDoUsuario(registro.vagaId, usuario);
    return this.prisma.habilidade.update({ where: { id }, data: dto });
  }

  async remover(id: number, usuario: Usuario) {
    const registro = await this.buscarPorId(id);
    await this.vagaDoUsuario(registro.vagaId, usuario);
    return this.prisma.habilidade.delete({ where: { id } });
  }
}
