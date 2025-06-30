import { ApiProperty } from '@nestjs/swagger'
import { Expose, plainToInstance } from 'class-transformer'

import User from '@domain/models/users.model'

import TransformDate from '../shared/transform-date.helpers'

export class UserDTO {
  @Expose()
  @ApiProperty({
    description: 'The id of the user',
    example: '641484f003c96fe562c53abd',
  })
  id: string

  @Expose()
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string

  @Expose()
  @ApiProperty({
    description: 'The nickname of the user',
    example: 'John Doe',
  })
  nickname: string

  @Expose()
  @ApiProperty({
    description: 'The unique email of the user',
    example: 'john.doe@email.com',
  })
  email: string

  @Expose()
  @ApiProperty({
    description: 'The email verification status of the user',
    example: true,
  })
  email_verified: boolean

  @Expose()
  @ApiProperty({
    description: 'The picture of the user',
    example: 'https://example.com/image.jpg',
  })
  picture: string

  @Expose()
  @ApiProperty({
    description: 'The position of the user',
    example: 'Developer',
  })
  position: string

  @Expose()
  @ApiProperty({ description: 'The creation date of the user' })
  @TransformDate()
  createdAt: Date

  @Expose()
  @ApiProperty({ description: 'The date of the last user update' })
  @TransformDate()
  updatedAt: Date

  static toViewModel(user: User | User[]): UserDTO | UserDTO[] {
    return plainToInstance(UserDTO, user, { excludeExtraneousValues: true })
  }
}
