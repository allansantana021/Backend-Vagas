// Popula as tabelas de apoio (status, area, nivel) para que seja possível criar vagas.
// Rodar com: npm run seed
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const status = [
    { id: 1, nome: 'Pendente', descricao: 'Aguardando moderação' },
    {
      id: 2,
      nome: 'Ativa',
      descricao: 'Vaga publicada e aberta a candidaturas',
    },
    { id: 3, nome: 'Pausada', descricao: 'Vaga temporariamente suspensa' },
    { id: 4, nome: 'Encerrada', descricao: 'Vaga finalizada' },
    { id: 5, nome: 'Rejeitada', descricao: 'Reprovada na moderação' },
  ];
  const areas = ['Tecnologia', 'Design', 'Dados', 'Marketing'];
  const niveis = ['Estágio', 'Júnior', 'Pleno', 'Sênior'];

  for (const s of status) {
    await prisma.status.upsert({ where: { id: s.id }, update: s, create: s });
  }
  for (const [i, nome] of areas.entries()) {
    const id = i + 1;
    await prisma.area.upsert({
      where: { id },
      update: { nome },
      create: { id, nome, status: 1 },
    });
  }
  for (const [i, nome] of niveis.entries()) {
    const id = i + 1;
    await prisma.nivel.upsert({
      where: { id },
      update: { nome },
      create: { id, nome, status: 1 },
    });
  }
  console.log('Seed concluído: status, áreas e níveis criados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
