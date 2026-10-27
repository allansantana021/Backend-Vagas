import { Module } from '@nestjs/common';
import { RequisitoController } from './requisito.controller';
import { RequisitoService } from './requisito.service';

@Module({
  controllers: [RequisitoController],
  providers: [RequisitoService],
})
export class RequisitoModule {}
