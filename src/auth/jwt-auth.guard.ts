import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Papel, Usuario } from './usuario.interface';

const PAPEIS_VALIDOS: Papel[] = ['aluno', 'empresa', 'admin'];

/**
 * Valida o token JWT enviado em "Authorization: Bearer <token>".
 * O token é emitido por outro microsserviço; aqui só verificamos a assinatura
 * (segredo JWT_SECRET, vindo do Infisical) e lemos o papel do usuário.
 *
 * Payload esperado: { sub: <id do usuário>, papel: 'aluno' | 'empresa' | 'admin', empresaId?: number }
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly desativada: boolean;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    // Somente para desenvolvimento local: AUTH_DESATIVADA=true libera tudo como admin.
    this.desativada = config.get<string>('AUTH_DESATIVADA') === 'true';
    if (this.desativada) {
      this.logger.warn(
        'AUTENTICAÇÃO DESATIVADA (AUTH_DESATIVADA=true). Não use em produção!',
      );
    }
  }

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const requisicao = contexto.switchToHttp().getRequest();

    if (this.desativada) {
      requisicao.usuario = { id: 0, papel: 'admin' } as Usuario;
      return true;
    }

    const cabecalho: string | undefined = requisicao.headers['authorization'];
    const [tipo, token] = cabecalho?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token não informado');
    }

    try {
      const payload = await this.jwt.verifyAsync(token);
      const id = Number(payload.sub);
      if (!Number.isInteger(id) || !PAPEIS_VALIDOS.includes(payload.papel)) {
        throw new Error('payload inválido');
      }
      requisicao.usuario = {
        id,
        papel: payload.papel,
        empresaId:
          payload.papel === 'empresa'
            ? Number(payload.empresaId ?? payload.sub)
            : undefined,
      } as Usuario;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
