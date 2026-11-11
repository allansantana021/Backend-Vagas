import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Papeis } from '../auth/roles.decorator';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { Usuario } from '../auth/usuario.interface';
import { ConsultaPorVagaDto } from '../common/dto/consulta-por-vaga.dto';
import { HabilidadeService } from './habilidade.service';
import { AtualizarHabilidadeDto } from './dto/atualizar-habilidade.dto';
import { CriarHabilidadeDto } from './dto/criar-habilidade.dto';

@ApiTags('habilidades')
@ApiBearerAuth()
@Controller('habilidades')
export class HabilidadeController {
  constructor(private readonly servico: HabilidadeService) {}

  @Post()
  @Papeis('empresa', 'admin')
  criar(@Body() dto: CriarHabilidadeDto, @UsuarioAtual() usuario: Usuario) {
    return this.servico.criar(dto, usuario);
  }

  @Get()
  listar(@Query() consulta: ConsultaPorVagaDto) {
    return this.servico.listar(consulta.vagaId);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.servico.buscarPorId(id);
  }

  @Patch(':id')
  @Papeis('empresa', 'admin')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarHabilidadeDto,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servico.atualizar(id, dto, usuario);
  }

  @Delete(':id')
  @Papeis('empresa', 'admin')
  remover(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servico.remover(id, usuario);
  }
}
