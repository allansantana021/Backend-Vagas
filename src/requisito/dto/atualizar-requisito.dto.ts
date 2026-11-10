import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarRequisitoDto } from './criar-requisito.dto';

// A vaga à qual pertence não muda
export class AtualizarRequisitoDto extends PartialType(
  OmitType(CriarRequisitoDto, ['vagaId'] as const),
) {}
