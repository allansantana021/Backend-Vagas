import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHAVE_PAPEIS } from './roles.decorator';
import { Papel, Usuario } from './usuario.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const permitidos = this.reflector.getAllAndOverride<Papel[] | undefined>(
      CHAVE_PAPEIS,
      [contexto.getHandler(), contexto.getClass()],
    );
    if (!permitidos || permitidos.length === 0) return true;

    const usuario: Usuario | undefined = contexto
      .switchToHttp()
      .getRequest().usuario;
    if (!usuario || !permitidos.includes(usuario.papel)) {
      throw new ForbiddenException(
        'Seu perfil não tem permissão para acessar este recurso',
      );
    }
    return true;
  }
}
