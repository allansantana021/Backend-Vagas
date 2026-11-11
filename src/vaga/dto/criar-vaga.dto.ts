import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { MODALIDADES, TIPOS_CONTRATO } from '../constantes';

export class CriarVagaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salarioMin?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salarioMax?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cidade?: string;

  @IsOptional()
  @IsIn(MODALIDADES)
  modalidade?: string;

  @IsOptional()
  @IsIn(TIPOS_CONTRATO)
  tipoContrato?: string;

  @IsInt()
  areaId: number;

  @IsInt()
  nivelId: number;

  // Só o admin informa estes dois (para a empresa, vêm do token)
  @IsOptional()
  @IsInt()
  empresaId?: number;

  @IsOptional()
  @IsInt()
  recrutadorId?: number;
}
