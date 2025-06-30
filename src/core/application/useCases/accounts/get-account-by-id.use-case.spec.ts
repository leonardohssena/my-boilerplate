import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACCOUNT_ID, ACCOUNT_OBJECT } from '@test/mocks/account.mock'
import { InMemoryAccountRepository } from '@test/repositories/in-memory-account.repository'
import { ObjectId } from 'mongodb'

import { GetAccountByIdUseCase } from '@application/useCases/accounts'

describe('GetAccountByIdUseCase', () => {
  let useCase: GetAccountByIdUseCase
  let accountRepository: InMemoryAccountRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetAccountByIdUseCase,
        InMemoryAccountRepository,
        {
          provide: 'IAccountsRepository',
          useExisting: InMemoryAccountRepository,
        },
      ],
    }).compile()

    accountRepository = moduleRef.get<InMemoryAccountRepository>(InMemoryAccountRepository)
    useCase = moduleRef.get<GetAccountByIdUseCase>(GetAccountByIdUseCase)

    await accountRepository.create(ACCOUNT_OBJECT)
  })

  it('should be defined', () => {
    expect(useCase).toBeDefined()
  })

  it('should have a execute method', () => {
    expect(useCase.execute).toBeDefined()
  })

  it('should return an account', async () => {
    const account = await useCase.execute(ACCOUNT_ID)
    expect(account).toBeDefined()
    expect(account).toEqual(ACCOUNT_OBJECT)
  })

  it('should throw an error if account is not found', async () => {
    const rejects = await expect(useCase.execute(new ObjectId().toString())).rejects

    rejects.toThrow(NotFoundException)
    rejects.toThrow('Account not found.')
  })
})
