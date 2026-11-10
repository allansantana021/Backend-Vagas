import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarHabilidadeDto } from './criar-habilidade.dto';

// A vaga à qual pertence não muda
export class AtualizarHabilidadeDto extends PartialType(
  OmitType(CriarHabilidadeDto, ['vagaId'] as const),
) {}
