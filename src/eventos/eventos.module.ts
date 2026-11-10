import { Global, Module } from '@nestjs/common';
import { PublicadorEventos } from './publicador-eventos.service';

// Global: qualquer módulo pode injetar o PublicadorEventos sem importar este
@Global()
@Module({
  providers: [PublicadorEventos],
  exports: [PublicadorEventos],
})
export class EventosModule {}
