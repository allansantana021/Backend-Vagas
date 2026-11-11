// Gera um token JWT de TESTE (simula o microsserviço de autenticação).
// Uso:  npm run token -- aluno 1
//       npm run token -- empresa 10
//       npm run token -- admin 1
import 'dotenv/config';
import { JwtService } from '@nestjs/jwt';

const [papel, id] = process.argv.slice(2);
const segredo = process.env.JWT_SECRET;

if (
  !['aluno', 'empresa', 'admin'].includes(papel) ||
  !id ||
  isNaN(Number(id))
) {
  console.error('Uso: npm run token -- <aluno|empresa|admin> <id>');
  process.exit(1);
}
if (!segredo) {
  console.error('JWT_SECRET não definido (use o Infisical ou o arquivo .env).');
  process.exit(1);
}

const payload: Record<string, unknown> = { sub: Number(id), papel };
if (papel === 'empresa') payload.empresaId = Number(id);

const token = new JwtService({ secret: segredo }).sign(payload, {
  expiresIn: '8h',
});
console.log(`\nToken (${papel}, id ${id}) válido por 8h:\n\n${token}\n`);
console.log('No Swagger: botão "Authorize" e cole só o token (sem "Bearer").');
