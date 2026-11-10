import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

// Ex.: GET /vagas/minhas?statusId=2&q=front   |   GET /vagas/moderacao?statusId=1
export class ConsultaStatusDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  statusId?: number;

  @IsOptional()
  @IsString()
  q?: string;
}
