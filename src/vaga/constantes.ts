// Nomes dos status usados no fluxo da vaga (cadastrados pelo seed na tabela "status")
export const STATUS = {
  PENDENTE: 'Pendente', // criada pela empresa, aguardando moderação
  ATIVA: 'Ativa', // aprovada pelo admin, visível aos alunos
  PAUSADA: 'Pausada', // empresa pausou
  ENCERRADA: 'Encerrada', // empresa encerrou
  REJEITADA: 'Rejeitada', // admin rejeitou
} as const;

export const MODALIDADES = ['Remoto', 'Híbrido', 'Presencial'] as const;
export const TIPOS_CONTRATO = ['CLT', 'PJ', 'Estágio'] as const;
