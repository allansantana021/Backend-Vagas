import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CriarHabilidadeDto {
  @IsOptional()
  @IsString()
  @MaxLength(45)
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsInt()
  vagaId: number;
}
