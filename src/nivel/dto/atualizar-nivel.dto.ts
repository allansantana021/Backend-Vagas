import { PartialType } from '@nestjs/swagger';
import { CriarNivelDto } from './criar-nivel.dto';

export class AtualizarNivelDto extends PartialType(CriarNivelDto) {}
