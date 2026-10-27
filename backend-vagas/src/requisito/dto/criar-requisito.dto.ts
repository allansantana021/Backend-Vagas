import { IsInt, IsOptional, IsString } from 'class-validator';

export class CriarRequisitoDto {
  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsInt()
  vagaId: number;
}
