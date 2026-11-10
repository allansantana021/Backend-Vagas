import { PartialType } from '@nestjs/swagger';
import { CriarStatusDto } from './criar-status.dto';

export class AtualizarStatusDto extends PartialType(CriarStatusDto) {}
