import { Module } from '@nestjs/common';
import { VagaController } from './vaga.controller';
import { VagaService } from './vaga.service';

@Module({
  controllers: [VagaController],
  providers: [VagaService],
})
export class VagaModule {}
