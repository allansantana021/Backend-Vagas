import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AmqpConnectionManager,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';

// Exchange do tipo "topic": cada serviço interessado cria a sua própria fila
// e escolhe o que ouvir pela routing key (ex.: "vaga.*", "candidatura.criada")
export const EXCHANGE_EVENTOS = 'vagas.eventos';

@Injectable()
export class PublicadorEventos implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PublicadorEventos.name);
  private conexao?: AmqpConnectionManager;
  private canal?: ChannelWrapper;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('RABBITMQ_URL');
    if (!url) {
      this.logger.warn('RABBITMQ_URL não definida: eventos desativados');
      return;
    }
    this.conexao = connect([url]);
    this.conexao.on('connect', () => this.logger.log('RabbitMQ conectado'));
    this.conexao.on('disconnect', ({ err }) =>
      this.logger.warn(`RabbitMQ desconectado: ${err?.message}`),
    );
    this.canal = this.conexao.createChannel({
      json: true,
      setup: (canal: any) =>
        canal.assertExchange(EXCHANGE_EVENTOS, 'topic', { durable: true }),
    });
  }

  // Não bloqueia nem derruba a requisição se o RabbitMQ estiver fora do ar
  publicar(chave: string, dados: Record<string, unknown>) {
    if (!this.canal) return;
    this.canal
      .publish(
        EXCHANGE_EVENTOS,
        chave,
        { evento: chave, ocorridoEm: new Date().toISOString(), dados },
        { persistent: true, timeout: 3000 },
      )
      .catch((e: Error) =>
        this.logger.error(`Falha ao publicar "${chave}": ${e?.message}`),
      );
  }

  async onModuleDestroy() {
    await this.canal?.close();
    await this.conexao?.close();
  }
}
