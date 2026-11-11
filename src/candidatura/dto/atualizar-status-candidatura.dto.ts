import { IsIn } from 'class-validator';

export const STATUS_CANDIDATURA = [
  'Em análise',
  'Aprovada',
  'Rejeitada',
] as const;

export class AtualizarStatusCandidaturaDto {
  @IsIn(STATUS_CANDIDATURA)
  status: string;
}
