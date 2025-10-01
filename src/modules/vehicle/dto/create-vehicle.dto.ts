import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, Matches, Length } from 'class-validator';
import { Transform } from 'class-transformer';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC1D23', description: 'Placa (padrão antigo ou Mercosul)' })
  @IsString()
  @Transform(({ value }) => String(value).trim().toUpperCase())
  @Matches(/^(?:[A-Z]{3}\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/, {
    message:
      'Placa inválida. Use ABC1234 (antiga) ou ABC1D23 (Mercosul).',
  })
  placa: string;

  @ApiProperty({ example: '9BWZZZ377VT004251', description: 'Chassi/VIN com 17 caracteres' })
  @IsString()
  @Transform(({ value }) => String(value).trim().toUpperCase())
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
    message:
      'Chassi inválido. Deve ter 17 caracteres alfanuméricos (sem I, O, Q).',
  })
  chassi: string;

  @ApiProperty({ example: '12345678901', description: 'RENAVAM com 11 dígitos' })
  @IsString()
  @Transform(({ value }) => String(value).trim())
  @Matches(/^\d{11}$/, {
    message: 'RENAVAM inválido. Deve conter 11 dígitos.',
  })
  renavam: string;

  @ApiProperty({ example: 'Onix' })
  @IsString()
  @Transform(({ value }) => String(value).trim())
  @Length(1, 120)
  modelo: string;

  @ApiProperty({ example: 'Chevrolet' })
  @IsString()
  @Transform(({ value }) => String(value).trim())
  @Length(1, 120)
  marca: string;

  @ApiProperty({ example: CURRENT_YEAR, minimum: 1900, maximum: CURRENT_YEAR + 1 })
  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  ano: number;
}