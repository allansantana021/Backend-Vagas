import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

// Ex.: GET /requisitos?vagaId=1
export class ConsultaPorVagaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vagaId?: number;
}
