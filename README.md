# Microsserviço de Vagas

Backend do Projeto Integrador V — microsserviço de **vagas** (e candidaturas), feito com **NestJS**, **Prisma**, **MySQL** e **Infisical** (gerenciamento de secrets).

Autenticação e cadastro de usuários/empresas são de **outro microsserviço**. Este serviço só **valida o token JWT** que ele emite e aplica as permissões por papel (`aluno`, `empresa`, `admin`).

## Tecnologias
NestJS 10 · Node.js 20+ · Prisma 6 · MySQL 8 · JWT (`@nestjs/jwt`) · class-validator · Swagger · Infisical

## Regras de negócio
- A empresa cria a vaga e ela nasce **Pendente**; o dono (`empresaId`) vem do token, nunca do corpo da requisição.
- O **admin modera**: aprova (Pendente → Ativa) ou rejeita (Pendente → Rejeitada).
- Alunos só enxergam vagas **Ativas**. O dono e o admin enxergam as vagas em qualquer status.
- A empresa dona pode **pausar** (Ativa → Pausada), **reativar** (Pausada → Ativa) e **encerrar** (Ativa/Pausada → Encerrada).
- Empresa só edita/exclui/gerencia **as próprias vagas**; o admin gerencia todas.
- O aluno se candidata **uma única vez** por vaga, e só a vagas Ativas. A empresa dona vê os candidatos e muda o status da candidatura (Em análise, Aprovada, Rejeitada).
- `salarioMax` não pode ser menor que `salarioMin`.
- Ao excluir uma vaga, candidaturas, requisitos e habilidades dela são removidos antes (transação).
- Área, nível e status só o admin altera.

## Endpoints
Documentação interativa: `http://localhost:3000/api` (botão **Authorize** para colar o token).

| Rota | Quem | O que faz |
|---|---|---|
| `POST /vagas` | empresa, admin | Cria vaga (nasce Pendente) |
| `GET /vagas` | todos | Catálogo (filtros: `areaId`, `nivelId`, `cidade`, `modalidade`, `tipoContrato`, `q`; admin também `statusId`, `empresaId`) |
| `GET /vagas/minhas` | empresa | Vagas da empresa, com nº de candidatos (`?statusId=&q=`) |
| `GET /vagas/moderacao` | admin | Fila de moderação (padrão: Pendentes) |
| `GET /vagas/:id` | todos* | Detalhes com requisitos e habilidades (*não-Ativas só dono/admin) |
| `PATCH /vagas/:id` · `DELETE /vagas/:id` | dono, admin | Edita / exclui |
| `PATCH /vagas/:id/aprovar` · `/rejeitar` | admin | Moderação |
| `PATCH /vagas/:id/pausar` · `/reativar` · `/encerrar` | dono, admin | Gestão da vaga |
| `POST /vagas/:vagaId/candidaturas` | aluno | Candidatar-se |
| `GET /vagas/:vagaId/candidaturas` | dono, admin | Lista candidatos |
| `GET /candidaturas/minhas` | aluno | Minhas candidaturas |
| `PATCH /candidaturas/:id/status` | dono, admin | Atualiza status da candidatura |
| `DELETE /candidaturas/:id` | aluno (própria), admin | Cancela candidatura |
| `/requisitos` · `/habilidades` | leitura: todos; escrita: dono da vaga, admin | CRUD ligado à vaga (`?vagaId=`) |
| `/areas` · `/niveis` · `/status` | leitura: todos; escrita: admin | Tabelas de apoio |

## Como rodar

### 1. Pré-requisitos
- Node.js 20+ e **MySQL em execução** (serviço `MySQL80` ou XAMPP)
- Infisical CLI: `npm install -g @infisical/cli`

### 2. Secrets no Infisical
Crie um projeto (ex.: `vagas-service`) e, no ambiente **Development**, cadastre:

| Secret | Exemplo |
|---|---|
| `DATABASE_URL` | `mysql://root:SUASENHA@localhost:3306/20262M_prj5_vagas_vaga` |
| `JWT_SECRET` | o **mesmo segredo** usado pelo microsserviço de autenticação |

Se a senha tiver `@`, `#` ou `/`, troque por `%40`, `%23` e `%2F`.

### 3. Instalar e vincular
```bash
npm install
infisical login
infisical init          # selecione o projeto deste microsserviço
```

### 4. Criar tabelas, dados iniciais e iniciar
```bash
npm run prisma:migrate:infisical     # cria o banco/tabelas (nome da migration: inicial)
npm run seed:infisical               # status, áreas e níveis
npm run start:dev:infisical          # API em http://localhost:3000
```
> Commite a pasta `prisma/migrations` gerada: o Docker/CI usa `prisma migrate deploy`.

**Sem Infisical (alternativa local):** copie `.env.example` para `.env`, preencha, e use os mesmos scripts sem o sufixo: `npm run prisma:migrate`, `npm run seed`, `npm run start:dev`.

### 5. Gerar um token de teste
O token real vem do microsserviço de autenticação. Para testar localmente:
```bash
npm run token:infisical -- admin 1
npm run token:infisical -- empresa 10
npm run token:infisical -- aluno 7
```
No Swagger, clique em **Authorize** e cole o token. Payload esperado: `{ "sub": <id>, "papel": "aluno|empresa|admin", "empresaId": <id> }`.

### 6. Testes
```bash
npm test
```

## Roteiro de demonstração
1. Token de **empresa** (id 10) → `POST /vagas` → vaga nasce **Pendente**.
2. Token de **aluno** → `GET /vagas` → vaga não aparece ainda.
3. Token de **admin** → `GET /vagas/moderacao` → `PATCH /vagas/1/aprovar`.
4. Token de **aluno** → `GET /vagas` (agora aparece) → `POST /vagas/1/candidaturas`.
5. Token de **empresa** → `GET /vagas/1/candidaturas` → `PATCH /candidaturas/1/status` → `PATCH /vagas/1/pausar`.

## Modelo de dados
Baseado no modelo MySQL Workbench do projeto (`status`, `area`, `nivel`, `vaga`, `requisito`, `skill`; no código a tabela `skill` é o modelo `Habilidade`). Diferenças em relação ao modelo original:
- IDs com `AUTO_INCREMENT`;
- salários `DECIMAL(10,2)` (o `DECIMAL` padrão do MySQL não guarda centavos);
- `vaga_titulo` e `area_nome` com `VARCHAR(100)` (antes 45 e `TEXT`);
- **acrescentados**: `vaga_cidade`, `vaga_modalidade`, `vaga_tipo_contrato`, `vaga_publicada_em` e a tabela `candidatura` (exigidos pelas telas).

## Segurança
- Secrets (senha do banco, segredo do JWT) só no Infisical; `.env` está no `.gitignore`.
- Rotas protegidas por JWT e por papel; a empresa dona é sempre derivada do token.
- `AUTH_DESATIVADA=true` existe **apenas** para desenvolvimento local e nunca deve ser usado em produção.
