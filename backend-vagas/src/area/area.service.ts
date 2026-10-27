import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarAreaDto } from './dto/atualizar-area.dto';
import { CriarAreaDto } from './dto/criar-area.dto';

@Injectable()
export class AreaService {
  constructor(private readonly prisma: PrismaService) {}

  criar(dto: CriarAreaDto) {
    return this.prisma.area.create({ data: dto });
  }

  listar() {
    return this.prisma.area.findMany({ orderBy: { id: 'asc' } });
  }

  async buscarPorId(id: number) {
    const registro = await this.prisma.area.findUnique({ where: { id } });
    if (!registro) throw new NotFoundException(`Area ${id} não encontrado(a)`);
    return registro;
  }

  async atualizar(id: number, dto: AtualizarAreaDto) {
    await this.buscarPorId(id);
    return this.prisma.area.update({ where: { id }, data: dto });
  }

  async remover(id: number) {
    await this.buscarPorId(id);
    return this.prisma.area.delete({ where: { id } });
  }
}
