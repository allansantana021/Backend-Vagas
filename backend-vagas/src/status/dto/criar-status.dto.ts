import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CriarStatusDto {
  @IsOptional()
  @IsString()
  @MaxLength(45)
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
