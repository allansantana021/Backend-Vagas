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
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { CriarStatusDto } from './dto/criar-status.dto';
import { StatusService } from './status.service';

@ApiTags('status')
@ApiBearerAuth()
@Controller('status')
export class StatusController {
  constructor(private readonly servico: StatusService) {}

  @Post()
  @Papeis('admin')
  criar(@Body() dto: CriarStatusDto) {
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
    @Body() dto: AtualizarStatusDto,
  ) {
    return this.servico.atualizar(id, dto);
  }

  @Delete(':id')
  @Papeis('admin')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.servico.remover(id);
  }
}
