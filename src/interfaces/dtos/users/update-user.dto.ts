import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsOptional()
  position: string
}
