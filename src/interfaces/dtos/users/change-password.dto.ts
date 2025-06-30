import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword' })
  @IsString()
  currentPassword: string

  @ApiProperty({ example: 'newPassword' })
  @IsString()
  @MinLength(6)
  newPassword: string
}
