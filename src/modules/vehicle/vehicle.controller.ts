import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe, // ou ParseIntPipe se seu id for inteiro
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehiclePrismaExceptionFilter } from './filters/vehicle-prisma-exception.filter';

@ApiTags('vehicles')
@UseFilters(VehiclePrismaExceptionFilter) // aplica apenas para este controller
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly service: VehicleService) { }

  @Post()
  @ApiOperation({ summary: 'Criar veículo' })
  @ApiResponse({ status: 201, description: 'Veículo criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'Conflito de unicidade (placa/chassi/renavam).' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  create(@Body() dto: CreateVehicleDto) {
    return this.service.createVehicle(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar veículos' })
  findAll() {
    return this.service.getVehicles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter veículo por id' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado.' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.getVehicleById(id as string);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  @ApiResponse({ status: 200, description: 'Veículo atualizado.' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado.' })
  @ApiResponse({ status: 409, description: 'Conflito de unicidade.' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: Partial<CreateVehicleDto>) {
    return this.service.updateVehicle(dto, id as string);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir veículo' })
  @ApiResponse({ status: 204, description: 'Veículo excluído.' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.deleteVehicle(id as string);
  }
}