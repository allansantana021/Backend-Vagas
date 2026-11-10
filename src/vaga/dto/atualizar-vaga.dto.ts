import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarVagaDto } from './criar-vaga.dto';

// O dono da vaga (empresa/recrutador) não muda; o status muda só pelas rotas de fluxo.
export class AtualizarVagaDto extends PartialType(
  OmitType(CriarVagaDto, ['empresaId', 'recrutadorId'] as const),
) {}
