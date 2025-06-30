import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator'

export class UpdateAccountDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @ApiProperty({ example: 'john.doe' })
  @IsNotEmpty()
  @IsOptional()
  nickname?: string

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  @IsOptional()
  picture?: string
}
