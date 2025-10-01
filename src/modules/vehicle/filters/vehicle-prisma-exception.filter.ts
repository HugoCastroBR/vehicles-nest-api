import { Request } from 'express';
import { PrismaExceptionFilter } from 'src/core/common/filters/prisma-excpetion.filter';

export class VehiclePrismaExceptionFilter extends PrismaExceptionFilter {
  protected override mapPrismaKnownRequestError(error: { code: string; meta?: any; message?: string }, req: Request) {
    const base = super.mapPrismaKnownRequestError(error, req);
    const code = error.code;
    const meta = error.meta ?? {};
    const target = Array.isArray(meta.target) ? meta.target : meta.target ? [meta.target] : [];

    const isVehicleIdRoute =
      /^\/(?:api\/)?vehicles\/[^/]+$/.test(req.path) &&
      (req.method === 'GET' || req.method === 'PATCH' || req.method === 'DELETE');

    if (code === 'P2002') {
      if (target.includes('placa')) return { ...base, status: 409, message: 'Já existe um veículo com esta placa.' };
      if (target.includes('chassi')) return { ...base, status: 409, message: 'Já existe um veículo com este chassi.' };
      if (target.includes('renavam')) return { ...base, status: 409, message: 'Já existe um veículo com este RENAVAM.' };
      return { ...base, status: 409, message: 'Conflito de unicidade em veículo.' };
    }

    if (code === 'P2025') {
      return { ...base, status: 404, message: 'Veículo não encontrado.' };
    }
    if (code === 'P2023' && isVehicleIdRoute) {
      return { ...base, status: 404, message: 'Veículo não encontrado.' };
    }

    return base;
  }
}