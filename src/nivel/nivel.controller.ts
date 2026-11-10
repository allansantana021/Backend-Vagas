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
import { AtualizarNivelDto } from './dto/atualizar-nivel.dto';
import { CriarNivelDto } from './dto/criar-nivel.dto';
import { NivelService } from './nivel.service';

@ApiTags('niveis')
@ApiBearerAuth()
@Controller('niveis')
export class NivelController {
  constructor(private readonly servico: NivelService) {}

  @Post()
  @Papeis('admin')
  criar(@Body() dto: CriarNivelDto) {
    return this.servico.criar(dto);
  }

  @Get()
  listar() {
    return this.servico.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.servico.buscarPorId(id);
  }

  @Patch(':id')
  @Papeis('admin')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarNivelDto,
  ) {
    return this.servico.atualizar(id, dto);
  }

  @Delete(':id')
  @Papeis('admin')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.servico.remover(id);
  }
}
