import { PartialType } from '@nestjs/swagger';
import { CriarAreaDto } from './criar-area.dto';

export class AtualizarAreaDto extends PartialType(CriarAreaDto) {}
