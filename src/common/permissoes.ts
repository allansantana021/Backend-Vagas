import { ForbiddenException } from '@nestjs/common';
import { Usuario } from '../auth/usuario.interface';

// Admin gerencia tudo; empresa só gerencia as vagas da própria empresa.
export function podeGerenciarVaga(
  usuario: Usuario,
  vaga: { empresaId: number },
): boolean {
  if (usuario.papel === 'admin') return true;
  return usuario.papel === 'empresa' && usuario.empresaId === vaga.empresaId;
}

export function exigirDonoOuAdmin(
  usuario: Usuario,
  vaga: { empresaId: number },
): void {
  if (!podeGerenciarVaga(usuario, vaga)) {
    throw new ForbiddenException(
      'Você não tem permissão para gerenciar esta vaga',
    );
  }
}
