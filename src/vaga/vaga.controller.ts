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
import { AtualizarVagaDto } from './dto/atualizar-vaga.dto';
import { ConsultaStatusDto } from './dto/consulta-status.dto';
import { CriarVagaDto } from './dto/criar-vaga.dto';
import { FiltrarVagaDto } from './dto/filtrar-vaga.dto';
import { VagaService } from './vaga.service';

@ApiTags('vagas')
@ApiBearerAuth()
@Controller('vagas')
export class VagaController {
  constructor(private readonly servico: VagaService) {}

  @Post()
  @Papeis('empresa', 'admin')
  criar(@Body() dto: CriarVagaDto, @UsuarioAtual() usuario: Usuario) {
    return this.servico.criar(dto, usuario);
  }

  @Get()
  listar(@Query() filtros: FiltrarVagaDto, @UsuarioAtual() usuario: Usuario) {
    return this.servico.listar(filtros, usuario);
  }

  // As rotas fixas (minhas, moderacao) vêm antes de ":id"
  @Get('minhas')
  @Papeis('empresa')
  minhas(
    @UsuarioAtual() usuario: Usuario,
    @Query() consulta: ConsultaStatusDto,
  ) {
    return this.servico.minhas(usuario, consulta.statusId, consulta.q);
  }

  @Get('moderacao')
  @Papeis('admin')
  moderacao(@Query() consulta: ConsultaStatusDto) {
    return this.servico.moderacao(consulta.statusId);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioAtual() usuario: Usuario,
  ) {
    return this.servico.buscarPorId(id, usuario);
  }

  @Patch(':id')
  @Papeis('empresa', 'admin')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarVagaDto,
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

  // ----- fluxo de status -----

  @Patch(':id/aprovar')
  @Papeis('admin')
  aprovar(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() u: Usuario) {
    return this.servico.aprovar(id, u);
  }

  @Patch(':id/rejeitar')
  @Papeis('admin')
  rejeitar(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() u: Usuario) {
    return this.servico.rejeitar(id, u);
  }

  @Patch(':id/pausar')
  @Papeis('empresa', 'admin')
  pausar(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() u: Usuario) {
    return this.servico.pausar(id, u);
  }

  @Patch(':id/reativar')
  @Papeis('empresa', 'admin')
  reativar(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() u: Usuario) {
    return this.servico.reativar(id, u);
  }

  @Patch(':id/encerrar')
  @Papeis('empresa', 'admin')
  encerrar(@Param('id', ParseIntPipe) id: number, @UsuarioAtual() u: Usuario) {
    return this.servico.encerrar(id, u);
  }
}
