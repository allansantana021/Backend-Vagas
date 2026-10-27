import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CriarAreaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome?: string;

  @IsOptional()
  @IsInt()
  status?: number;
}
