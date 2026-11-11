import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { MODALIDADES, TIPOS_CONTRATO } from '../constantes';

// Ex.: GET /vagas?areaId=1&cidade=São Paulo&modalidade=Remoto&q=back
export class FiltrarVagaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  areaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  nivelId?: number;

  // Só o admin consegue filtrar por status (os demais veem apenas vagas Ativas)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statusId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empresaId?: number;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsIn(MODALIDADES)
  modalidade?: string;

  @IsOptional()
  @IsIn(TIPOS_CONTRATO)
  tipoContrato?: string;

  // busca por parte do título
  @IsOptional()
  @IsString()
  q?: string;
}
