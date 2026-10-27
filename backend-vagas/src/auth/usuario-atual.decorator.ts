import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from './usuario.interface';

// Injeta o usuário autenticado no parâmetro do método do controller.
export const UsuarioAtual = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext): Usuario => {
    return contexto.switchToHttp().getRequest().usuario;
  },
);
