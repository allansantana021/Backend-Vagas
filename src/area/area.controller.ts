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
import { AtualizarAreaDto } from './dto/atualizar-area.dto';
import { CriarAreaDto } from './dto/criar-area.dto';
import { AreaService } from './area.service';

@ApiTags('areas')
@ApiBearerAuth()
@Controller('areas')
export class AreaController {
  constructor(private readonly servico: AreaService) {}

  @Post()
  @Papeis('admin')
  criar(@Body() dto: CriarAreaDto) {
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
    @Body() dto: AtualizarAreaDto,
  ) {
    return this.servico.atualizar(id, dto);
  }

  @Delete(':id')
  @Papeis('admin')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.servico.remover(id);
  }
}
