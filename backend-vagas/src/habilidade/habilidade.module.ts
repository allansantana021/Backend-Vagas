import { Module } from '@nestjs/common';
import { HabilidadeController } from './habilidade.controller';
import { HabilidadeService } from './habilidade.service';

@Module({
  controllers: [HabilidadeController],
  providers: [HabilidadeService],
})
export class HabilidadeModule {}
