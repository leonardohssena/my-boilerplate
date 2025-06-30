import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'

import Account from '@domain/models/accounts.model'
import { AccountDto } from '@interfaces/dtos/accounts/response'
import removeSpaces from '@shared/helpers/string-remove-spaces.helper'

export const ACCOUNT_ID = '6855aa3367ec8346dc08afdf'

export const ACCOUNT_OBJECT = new Account({
  id: ACCOUNT_ID,
  name: 'Test Account',
  nickname: 'test_account',
  picture: 'https://example.com/image.jpg',
  isActive: true,
  deleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const ACCOUNT_DTO_OBJECT = AccountDto.toViewModel(ACCOUNT_OBJECT)

export function createAccountMock(override?: Partial<Account>) {
  const name = faker.company.name()
  return new Account({
    id: new ObjectId().toString(),
    name,
    nickname: removeSpaces(name).toLocaleLowerCase(),
    picture: faker.image.avatar(),
    isActive: true,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  })
}
