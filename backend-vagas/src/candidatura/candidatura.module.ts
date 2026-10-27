import { Module } from '@nestjs/common';
import { CandidaturaController } from './candidatura.controller';
import { CandidaturaService } from './candidatura.service';

@Module({
  controllers: [CandidaturaController],
  providers: [CandidaturaService],
})
export class CandidaturaModule {}
