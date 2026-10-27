import { Module } from '@nestjs/common';
import { NivelController } from './nivel.controller';
import { NivelService } from './nivel.service';

@Module({
  controllers: [NivelController],
  providers: [NivelService],
})
export class NivelModule {}
