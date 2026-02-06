import {
    IsDateString,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator'
import { TipoTransporte } from '@prisma/client'

export class CreateViagemDto {
    @IsString()
    @IsNotEmpty()
    titulo: string

    @IsEnum(TipoTransporte)
    tipoTransporte: TipoTransporte

    @IsOptional()
    @IsNumber()
    @Min(0)
    valorPassagem?: number

    @IsDateString()
    dataInicio: string

    @IsDateString()
    dataFim: string

    @IsOptional()
    @IsString()
    aeroporto?: string

    @IsOptional()
    @IsString()
    trajeto?: string

    @IsOptional()
    @IsNumber()
    @Min(0)
    km?: number

    @IsOptional()
    @IsNumber()
    @Min(0)
    autonomia?: number

    @IsOptional()
    @IsNumber()
    @Min(0)
    pedagio?: number

    @IsOptional()
    @IsNumber()
    @Min(0)
    aluguelCarro?: number

    @IsOptional()
    @IsString()
    enderecoHospedagem?: string

    @IsOptional()
    @IsString()
    nomeHospedagem?: string

    @IsOptional()
    @IsNumber()
    @Min(0)
    custoHospedagem?: number

    @IsOptional()
    @IsNumber()
    @Min(0)
    valorGasolina?: number
}
