import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { VehicleController } from '../vehicle.controller';
import { VehicleService } from '../vehicle.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';

describe('VehicleController (HTTP)', () => {
  let app: INestApplication;

  const now = new Date().toISOString();
  const VALID_UUID = '18a85699-9773-47a5-a65a-b57132975daa';
  const NON_EXISTENT_UUID = '18a85699-9773-47a5-a65a-b57132975dbb';

  const vehicle = {
    id: VALID_UUID,
    placa: 'ABC1D23',
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678901',
    modelo: 'Onix',
    marca: 'Chevrolet',
    ano: 2024,
    createdAt: now,
    updatedAt: now
  };

  const mockService = {
    createVehicle: jest.fn(),
    getVehicles: jest.fn(),
    getVehicleById: jest.fn(),
    updateVehicle: jest.fn(),
    deleteVehicle: jest.fn()
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [{ provide: VehicleService, useValue: mockService }]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /vehicles', () => {
    it('201 deve criar veículo', async () => {
      mockService.createVehicle.mockResolvedValue(vehicle);

      const body: CreateVehicleDto = {
        placa: 'ABC1D23',
        chassi: '9BWZZZ377VT004251',
        renavam: '12345678901',
        modelo: 'Onix',
        marca: 'Chevrolet',
        ano: 2024
      };

      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .send(body)
        .expect(201);

      expect(mockService.createVehicle).toHaveBeenCalledWith(body);
      expect(res.body).toMatchObject({ id: VALID_UUID, placa: 'ABC1D23' });
    });

    it('409 deve mapear P2002 (placa) para mensagem personalizada', async () => {
      mockService.createVehicle.mockRejectedValue({ code: 'P2002', meta: { target: ['placa'] } });

      const body: CreateVehicleDto = {
        placa: 'ABC1D23',
        chassi: '9BWZZZ377VT004251',
        renavam: '12345678901',
        modelo: 'Onix',
        marca: 'Chevrolet',
        ano: 2024
      };

      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .send(body)
        .expect(409);

      expect(res.body.statusCode).toBe(409);
      expect(res.body.message).toBe('Já existe um veículo com esta placa.');
      expect(res.body.details).toMatchObject({ code: 'P2002', target: ['placa'] });
    });

    it('400 deve falhar validação DTO (placa inválida)', async () => {
      mockService.createVehicle.mockResolvedValue(vehicle); // não deve ser chamado

      const invalidBody = {
        placa: 'INVALIDA',
        chassi: '9BWZZZ377VT004251',
        renavam: '12345678901',
        modelo: 'Onix',
        marca: 'Chevrolet',
        ano: 2024
      };

      const res = await request(app.getHttpServer())
        .post('/vehicles')
        .send(invalidBody)
        .expect(400);

      expect(mockService.createVehicle).not.toHaveBeenCalled();
      expect(res.body.statusCode).toBe(400);
    });
  });

  describe('GET /vehicles', () => {
    it('200 deve listar veículos', async () => {
      mockService.getVehicles.mockResolvedValue([vehicle]);

      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .expect(200);

      expect(mockService.getVehicles).toHaveBeenCalled();
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toMatchObject({ id: VALID_UUID });
    });
  });

  describe('GET /vehicles/:id', () => {
    it('200 deve retornar veículo', async () => {
      mockService.getVehicleById.mockResolvedValue(vehicle);

      const res = await request(app.getHttpServer())
        .get(`/vehicles/${VALID_UUID}`)
        .expect(200);

      expect(mockService.getVehicleById).toHaveBeenCalledWith(VALID_UUID);
      expect(res.body.id).toBe(VALID_UUID);
    });

    it('400 deve falhar com id inválido (ParseUUIDPipe)', async () => {
      mockService.getVehicleById.mockResolvedValue(vehicle); // não deve ser chamado

      await request(app.getHttpServer())
        .get('/vehicles/not-a-uuid')
        .expect(400);

      expect(mockService.getVehicleById).not.toHaveBeenCalled();
    });

    it('404 deve retornar NotFoundException', async () => {
      mockService.getVehicleById.mockRejectedValue(new NotFoundException('Veículo não encontrado.'));

      const res = await request(app.getHttpServer())
        .get(`/vehicles/${NON_EXISTENT_UUID}`)
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toBe('Veículo não encontrado.');
    });
  });

  describe('PATCH /vehicles/:id', () => {
    it('200 deve atualizar veículo', async () => {
      mockService.updateVehicle.mockResolvedValue({ ...vehicle, modelo: 'Onix Plus' });

      const res = await request(app.getHttpServer())
        .patch(`/vehicles/${VALID_UUID}`)
        .send({ modelo: 'Onix Plus' })
        .expect(200);

      expect(mockService.updateVehicle).toHaveBeenCalledWith({ modelo: 'Onix Plus' }, VALID_UUID);
      expect(res.body.modelo).toBe('Onix Plus');
    });

    it('409 deve mapear P2002 (renavam) com mensagem personalizada', async () => {
      mockService.updateVehicle.mockRejectedValue({ code: 'P2002', meta: { target: ['renavam'] } });

      const res = await request(app.getHttpServer())
        .patch(`/vehicles/${VALID_UUID}`)
        .send({ renavam: '12345678901' })
        .expect(409);

      expect(res.body.statusCode).toBe(409);
      expect(res.body.message).toBe('Já existe um veículo com este RENAVAM.');
      expect(res.body.details).toMatchObject({ code: 'P2002', target: ['renavam'] });
    });

    it('404 deve mapear P2025 (registro não encontrado)', async () => {
      mockService.updateVehicle.mockRejectedValue({ code: 'P2025' });

      const res = await request(app.getHttpServer())
        .patch(`/vehicles/${VALID_UUID}`)
        .send({ modelo: 'Teste' })
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toBe('Veículo não encontrado.');
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('204 deve excluir veículo', async () => {
      mockService.deleteVehicle.mockResolvedValue(vehicle);

      await request(app.getHttpServer())
        .delete(`/vehicles/${VALID_UUID}`)
        .expect(204);

      expect(mockService.deleteVehicle).toHaveBeenCalledWith(VALID_UUID);
    });

    it('404 deve mapear P2025 (id inexistente)', async () => {
      mockService.deleteVehicle.mockRejectedValue({ code: 'P2025' });

      const res = await request(app.getHttpServer())
        .delete(`/vehicles/${VALID_UUID}`)
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toBe('Veículo não encontrado.');
    });
  });

  describe('PATCH/DELETE com id inconsistente (P2023)', () => {
    it('404 deve mapear P2023 para 404 nas rotas de id do veículo (update)', async () => {
      mockService.updateVehicle.mockRejectedValue({ code: 'P2023' });

      const res = await request(app.getHttpServer())
        .patch(`/vehicles/${VALID_UUID}`)
        .send({ modelo: 'X' })
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toBe('Veículo não encontrado.');
    });

    it('404 deve mapear P2023 para 404 nas rotas de id do veículo (delete)', async () => {
      mockService.deleteVehicle.mockRejectedValue({ code: 'P2023' });

      const res = await request(app.getHttpServer())
        .delete(`/vehicles/${VALID_UUID}`)
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toBe('Veículo não encontrado.');
    });
  });
});