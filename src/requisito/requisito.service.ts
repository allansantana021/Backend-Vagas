import { Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from '../auth/usuario.interface';
import { exigirDonoOuAdmin } from '../common/permissoes';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarRequisitoDto } from './dto/atualizar-requisito.dto';
import { CriarRequisitoDto } from './dto/criar-requisito.dto';

@Injectable()
export class RequisitoService {
  constructor(private readonly prisma: PrismaService) {}

  private async vagaDoUsuario(vagaId: number, usuario: Usuario) {
    const vaga = await this.prisma.vaga.findUnique({ where: { id: vagaId } });
    if (!vaga) throw new NotFoundException(`Vaga ${vagaId} não encontrada`);
    exigirDonoOuAdmin(usuario, vaga);
  }

  async criar(dto: CriarRequisitoDto, usuario: Usuario) {
    await this.vagaDoUsuario(dto.vagaId, usuario);
    return this.prisma.requisito.create({ data: dto });
  }

  listar(vagaId?: number) {
    return this.prisma.requisito.findMany({
      where: vagaId ? { vagaId } : undefined,
      orderBy: { id: 'asc' },
    });
  }

  async buscarPorId(id: number) {
    const registro = await this.prisma.requisito.findUnique({ where: { id } });
    if (!registro)
      throw new NotFoundException(`Requisito ${id} não encontrado(a)`);
    return registro;
  }

  async atualizar(id: number, dto: AtualizarRequisitoDto, usuario: Usuario) {
    const registro = await this.buscarPorId(id);
    await this.vagaDoUsuario(registro.vagaId, usuario);
    return this.prisma.requisito.update({ where: { id }, data: dto });
  }

  async remover(id: number, usuario: Usuario) {
    const registro = await this.buscarPorId(id);
    await this.vagaDoUsuario(registro.vagaId, usuario);
    return this.prisma.requisito.delete({ where: { id } });
  }
}
