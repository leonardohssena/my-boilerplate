import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator'

export class CreateAccountDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'john.doe' })
  @IsNotEmpty()
  nickname: string

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  @IsOptional()
  picture?: string
}
