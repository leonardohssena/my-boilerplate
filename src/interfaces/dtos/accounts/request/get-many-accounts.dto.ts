import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { BaseQueryDto } from '@interfaces/dtos/shared/base-query.dto'

export class GetManyAccountsDto extends BaseQueryDto {
  @ApiPropertyOptional({
    example: 'John Doe',
  })
  @IsOptional()
  name?: string
}
