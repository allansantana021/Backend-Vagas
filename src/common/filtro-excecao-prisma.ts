import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

// Converte erros do Prisma em respostas HTTP amigáveis
@Catch(Prisma.PrismaClientKnownRequestError)
export class FiltroExcecaoPrisma implements ExceptionFilter {
  catch(excecao: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const resposta = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensagem = 'Erro interno ao acessar o banco de dados';

    switch (excecao.code) {
      case 'P2025': // registro não encontrado
        status = HttpStatus.NOT_FOUND;
        mensagem = 'Registro não encontrado';
        break;
      case 'P2003': // violação de chave estrangeira
        status = HttpStatus.CONFLICT;
        mensagem =
          'Operação inválida: o registro referencia (ou é referenciado por) outro registro inexistente/existente';
        break;
      case 'P2002': // violação de unicidade
        status = HttpStatus.CONFLICT;
        mensagem = 'Já existe um registro com esses dados';
        break;
    }

    resposta.status(status).json({ statusCode: status, message: mensagem });
  }
}
