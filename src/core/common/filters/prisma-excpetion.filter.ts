import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';

function isObject(v: unknown): v is Record<string, any> {
  return v !== null && typeof v === 'object';
}

function isPrismaKnownRequestError(e: unknown): e is { code: string; meta?: any; message?: string } {
  return isObject(e) && typeof e.code === 'string' && /^P\d{4}$/.test(e.code);
}

function isPrismaValidationError(e: unknown): boolean {
  return isObject(e) && (e.name === 'PrismaClientValidationError' || /ValidationError/i.test(String(e)));
}

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      return res.status(status).json(this.body(status, req.path, response));
    }

    if (isPrismaKnownRequestError(exception)) {
      const { status, message, details } = this.mapPrismaKnownRequestError(exception, req);
      return res.status(status).json(this.body(status, req.path, { message, details }));
    }

    if (isPrismaValidationError(exception)) {
      const err = new BadRequestException({ message: 'Dados inválidos para a operação.' });
      const status = err.getStatus();
      return res.status(status).json(this.body(status, req.path, err.getResponse()));
    }

    const err = new InternalServerErrorException('Erro interno. Tente novamente mais tarde.');
    return res.status(err.getStatus()).json(this.body(err.getStatus(), req.path, err.getResponse()));
  }

  protected mapPrismaKnownRequestError(error: { code: string; meta?: any; message?: string }, _req: Request) {
    const code = error.code;
    const meta = error.meta ?? {};
    const target = Array.isArray(meta.target) ? meta.target : meta.target ? [meta.target] : [];
    const details = { code, target };

    switch (code) {
      case 'P2002':
        return { status: 409, message: 'Conflito de unicidade.', details };
      case 'P2025':
        return { status: 404, message: 'Registro não encontrado.', details };
      case 'P2000':
        return { status: 400, message: 'Valor excede o tamanho máximo permitido.', details };
      case 'P2003':
        return { status: 400, message: 'Violação de integridade referencial.', details };
      case 'P2011':
        return { status: 400, message: 'Campo obrigatório não pode ser nulo.', details };
      case 'P2012':
        return { status: 400, message: 'Campo obrigatório ausente.', details };
      case 'P2007':
      case 'P2009':
      case 'P2023':
        return { status: 400, message: 'Dados inválidos para a operação.', details };
      case 'P2021':
        return { status: 500, message: 'Estrutura do banco de dados não encontrada.', details };
      default:
        return { status: 400, message: `Falha na operação do banco de dados (${code}).`, details };
    }
  }

  protected body(statusCode: number, path: string, response: any) {
    const base = typeof response === 'string' ? { message: response } : response || {};
    return {
      statusCode,
      path,
      timestamp: new Date().toISOString(),
      ...base,
    };
  }
}