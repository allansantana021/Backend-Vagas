import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarNivelDto } from './dto/atualizar-nivel.dto';
import { CriarNivelDto } from './dto/criar-nivel.dto';

@Injectable()
export class NivelService {
  constructor(private readonly prisma: PrismaService) {}

  criar(dto: CriarNivelDto) {
    return this.prisma.nivel.create({ data: dto });
  }

  listar() {
    return this.prisma.nivel.findMany({ orderBy: { id: 'asc' } });
  }

  async buscarPorId(id: number) {
    const registro = await this.prisma.nivel.findUnique({ where: { id } });
    if (!registro) throw new NotFoundException(`Nivel ${id} não encontrado(a)`);
    return registro;
  }

  async atualizar(id: number, dto: AtualizarNivelDto) {
    await this.buscarPorId(id);
    return this.prisma.nivel.update({ where: { id }, data: dto });
  }

  async remover(id: number) {
    await this.buscarPorId(id);
    return this.prisma.nivel.delete({ where: { id } });
  }
}
