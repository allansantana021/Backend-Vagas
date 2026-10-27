import { SetMetadata } from '@nestjs/common';
import { Papel } from './usuario.interface';

export const CHAVE_PAPEIS = 'papeis';

// Restringe a rota a determinados papéis. Sem @Papeis, qualquer usuário logado acessa.
export const Papeis = (...papeis: Papel[]) => SetMetadata(CHAVE_PAPEIS, papeis);
