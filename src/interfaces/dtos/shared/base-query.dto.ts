import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator'

export class BaseQueryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  page: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  limit: number

  @ApiPropertyOptional({
    example: 'name',
  })
  @IsOptional()
  orderField?: string

  @ApiPropertyOptional({
    example: 'asc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc'
}
