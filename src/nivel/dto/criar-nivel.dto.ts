import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CriarNivelDto {
  @IsOptional()
  @IsString()
  @MaxLength(45)
  nome?: string;

  @IsOptional()
  @IsInt()
  status?: number;
}
