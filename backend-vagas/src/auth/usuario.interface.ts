export type Papel = 'aluno' | 'empresa' | 'admin';

// Usuário autenticado, montado a partir do JWT emitido pelo microsserviço de autenticação.
export interface Usuario {
  id: number;
  papel: Papel;
  // Só para papel "empresa": ID da empresa dona das vagas
  empresaId?: number;
}
