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
import { RequisitoService } from './requisito.service';
import { AtualizarRequisitoDto } from './dto/atualizar-requisito.dto';
import { CriarRequisitoDto } from './dto/criar-requisito.dto';

@ApiTags('requisitos')
@ApiBearerAuth()
@Controller('requisitos')
export class RequisitoController {
  constructor(private readonly servico: RequisitoService) {}

  @Post()
  @Papeis('empresa', 'admin')
  criar(@Body() dto: CriarRequisitoDto, @UsuarioAtual() usuario: Usuario) {
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
    @Body() dto: AtualizarRequisitoDto,
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
