import { ApiProperty } from '@nestjs/swagger'
import { Expose, plainToInstance } from 'class-transformer'

import Account from '@domain/models/accounts.model'
import TransformDate from '@interfaces/dtos/shared/transform-date.helpers'

export class AccountDto {
  @Expose()
  @ApiProperty({
    description: 'The id of the account',
    example: '641484f003c96fe562c53abd',
  })
  id: string

  @Expose()
  @ApiProperty({
    description: 'The name of the account',
    example: 'John Doe',
  })
  name: string

  @Expose()
  @ApiProperty({
    description: 'The nickname of the account',
    example: 'john.doe',
  })
  nickname: string

  @Expose()
  @ApiProperty({
    description: 'The image of the account',
    example: 'https://example.com/image.jpg',
  })
  picture: string

  @Expose()
  @ApiProperty({ description: 'The creation date of the account' })
  @TransformDate()
  createdAt: Date

  @Expose()
  @ApiProperty({ description: 'The date of the last account update' })
  @TransformDate()
  updatedAt: Date

  static toViewModel(account: Account | Account[]): AccountDto | AccountDto[] {
    return plainToInstance(AccountDto, account, { excludeExtraneousValues: true })
  }
}
