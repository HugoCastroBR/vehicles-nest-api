import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from '../vehicle.service';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { VehicleEventsPublisher } from '../messaging/vehicle-events.publisher';
import { of } from 'rxjs';

describe('VehicleService', () => {
  let service: VehicleService;
  let prisma: jest.Mocked<PrismaService>;

  const publisherMock = {
    emitCreated: jest.fn(() => of(undefined)),
    emitUpdated: jest.fn(() => of(undefined)),
    emitDeleted: jest.fn(() => of(undefined)),
  };

  const now = new Date().toISOString();
  const vehicleStub = {
    id: '18a85699-9773-47a5-a65a-b57132975daa',
    placa: 'ABC1D23',
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678901',
    modelo: 'Onix',
    marca: 'Chevrolet',
    ano: 2024,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(async () => {
    const prismaMock = {
      vehicle: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $disconnect: jest.fn(),
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: VehicleEventsPublisher, useValue: publisherMock },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('createVehicle', () => {
    it('deve criar um veículo com sucesso', async () => {
      const dto: CreateVehicleDto = {
        placa: 'ABC1D23',
        chassi: '9BWZZZ377VT004251',
        renavam: '12345678901',
        modelo: 'Onix',
        marca: 'Chevrolet',
        ano: 2024,
      };
      (prisma.vehicle.create as jest.Mock).mockResolvedValue({ ...vehicleStub, ...dto });

      const created = await service.createVehicle(dto);

      expect(prisma.vehicle.create).toHaveBeenCalledWith({ data: dto });
      expect(publisherMock.emitCreated).toHaveBeenCalled();
      expect(created).toMatchObject(dto);
    });

    it('deve propagar erro P2002 (placa duplicada)', async () => {
      const dto: CreateVehicleDto = {
        placa: 'ABC1D23',
        chassi: '9BWZZZ377VT004251',
        renavam: '12345678901',
        modelo: 'Onix',
        marca: 'Chevrolet',
        ano: 2024,
      };
      (prisma.vehicle.create as jest.Mock).mockRejectedValue({ code: 'P2002', meta: { target: ['placa'] } });

      await expect(service.createVehicle(dto)).rejects.toMatchObject({ code: 'P2002' });
      expect(publisherMock.emitCreated).not.toHaveBeenCalled();
    });
  });

  describe('getVehicles', () => {
    it('deve retornar uma lista de veículos', async () => {
      (prisma.vehicle.findMany as jest.Mock).mockResolvedValue([vehicleStub]);

      const list = await service.getVehicles();

      expect(prisma.vehicle.findMany).toHaveBeenCalled();
      expect(Array.isArray(list)).toBe(true);
      expect(list[0].id).toBe(vehicleStub.id);
    });
  });

  describe('getVehicleById', () => {
    it('deve retornar o veículo quando encontrado', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(vehicleStub);

      const v = await service.getVehicleById(vehicleStub.id);

      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: vehicleStub.id } });
      expect(v.id).toBe(vehicleStub.id);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getVehicleById('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateVehicle', () => {
    it('deve atualizar um veículo com sucesso', async () => {
      const dto: Partial<CreateVehicleDto> = { modelo: 'Onix Plus' } as any;
      (prisma.vehicle.update as jest.Mock).mockResolvedValue({ ...vehicleStub, ...dto });

      const updated = await service.updateVehicle(dto, vehicleStub.id);

      expect(prisma.vehicle.update).toHaveBeenCalledWith({ where: { id: vehicleStub.id }, data: dto });
      expect(updated.modelo).toBe('Onix Plus');
      expect(publisherMock.emitUpdated).toHaveBeenCalled();
    });

    it('deve propagar erro P2025 (id inexistente)', async () => {
      (prisma.vehicle.update as jest.Mock).mockRejectedValue({ code: 'P2025' });

      await expect(service.updateVehicle({}, vehicleStub.id as any)).rejects.toMatchObject({ code: 'P2025' });
      expect(publisherMock.emitUpdated).not.toHaveBeenCalled();
    });

    it('deve propagar erro P2002 (conflito de unicidade em update)', async () => {
      (prisma.vehicle.update as jest.Mock).mockRejectedValue({ code: 'P2002', meta: { target: ['renavam'] } });

      await expect(service.updateVehicle({ renavam: '12345678901' } as any, vehicleStub.id)).rejects.toMatchObject({
        code: 'P2002',
      });
      expect(publisherMock.emitUpdated).not.toHaveBeenCalled();
    });
  });

  describe('deleteVehicle', () => {
    it('deve deletar veículo com sucesso', async () => {
      (prisma.vehicle.delete as jest.Mock).mockResolvedValue(vehicleStub);

      const deleted = await service.deleteVehicle(vehicleStub.id);

      expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: vehicleStub.id } });
      expect(publisherMock.emitDeleted).toHaveBeenCalledWith({ id: deleted.id });
    });

    it('deve propagar erro P2025 ao deletar id inexistente', async () => {
      (prisma.vehicle.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });

      await expect(service.deleteVehicle('00000000-0000-0000-0000-000000000000')).rejects.toMatchObject({
        code: 'P2025',
      });
      expect(publisherMock.emitDeleted).not.toHaveBeenCalled();
    });
  });
});