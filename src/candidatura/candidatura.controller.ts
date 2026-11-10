import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Papeis } from '../auth/roles.decorator';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { Usuario } from '../auth/usuario.interface';
import { CandidaturaService } from './candidatura.service';
import { AtualizarStatusCandidaturaDto } from './dto/atualizar-status-candidatura.dto';

@ApiTags('candidaturas')
@ApiBearerAuth()
@Controller()
export class CandidaturaController {
  constructor(private readonly servico: CandidaturaService) {}

  @Post('vagas/:vagaId/candidaturas')
  @Papeis('aluno')
  candidatar(
    @Param('vagaId', ParseIntPipe) vagaId: number,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servico.candidatar(vagaId, usuario);
  }

  @Get('vagas/:vagaId/candidaturas')
  @Papeis('empresa', 'admin')
  listarPorVaga(
    @Param('vagaId', ParseIntPipe) vagaId: number,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servico.listarPorVaga(vagaId, usuario);
  }

  @Get('candidaturas/minhas')
  @Papeis('aluno')
  minhas(@UsuarioAtual() usuario: Usuario) {
    return this.servico.minhas(usuario);
  }

  @Patch('candidaturas/:id/status')
  @Papeis('empresa', 'admin')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarStatusCandidaturaDto,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servico.atualizarStatus(id, dto, usuario);
  }

  @Delete('candidaturas/:id')
  @Papeis('aluno', 'admin')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servico.cancelar(id, usuario);
  }
}
