import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { CriarStatusDto } from './dto/criar-status.dto';

@Injectable()
export class StatusService {
  constructor(private readonly prisma: PrismaService) {}

  criar(dto: CriarStatusDto) {
    return this.prisma.status.create({ data: dto });
  }

  listar() {
    return this.prisma.status.findMany({ orderBy: { id: 'asc' } });
  }

  async buscarPorId(id: number) {
    const registro = await this.prisma.status.findUnique({ where: { id } });
    if (!registro)
      throw new NotFoundException(`Status ${id} não encontrado(a)`);
    return registro;
  }

  async atualizar(id: number, dto: AtualizarStatusDto) {
    await this.buscarPorId(id);
    return this.prisma.status.update({ where: { id }, data: dto });
  }

  async remover(id: number) {
    await this.buscarPorId(id);
    return this.prisma.status.delete({ where: { id } });
  }
}
