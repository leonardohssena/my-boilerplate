import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACCOUNT_ID, ACCOUNT_OBJECT } from '@test/mocks/account.mock'
import { USER_ID } from '@test/mocks/user.mock'
import { InMemoryAccountRepository } from '@test/repositories/in-memory-account.repository'
import { ObjectId } from 'mongodb'

import { SoftDeleteAccountUseCase } from '@application/useCases/accounts'

describe('SoftDeleteAccountUseCase', () => {
  let useCase: SoftDeleteAccountUseCase
  let accountRepository: InMemoryAccountRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SoftDeleteAccountUseCase,
        InMemoryAccountRepository,
        {
          provide: 'IAccountsRepository',
          useExisting: InMemoryAccountRepository,
        },
      ],
    }).compile()

    accountRepository = moduleRef.get<InMemoryAccountRepository>(InMemoryAccountRepository)
    useCase = moduleRef.get<SoftDeleteAccountUseCase>(SoftDeleteAccountUseCase)
  })

  beforeEach(async () => {
    accountRepository.clear()
    await accountRepository.create(ACCOUNT_OBJECT)
  })

  it('should be defined', () => {
    expect(useCase).toBeDefined()
  })

  it('should have a execute method', () => {
    expect(useCase.execute).toBeDefined()
  })

  it('should return an account', async () => {
    const account = await useCase.execute(ACCOUNT_ID, USER_ID)
    expect(account).toBeDefined()
    expect(account.deleted).toBe(true)
    expect(accountRepository.items[0].deleted).toBe(true)
    expect(accountRepository.items[0].deletedBy).toMatchObject({ id: USER_ID })
  })

  it('should throw an error if account is not found', async () => {
    const rejects = await expect(useCase.execute(new ObjectId().toString(), USER_ID)).rejects

    rejects.toThrow(NotFoundException)
    rejects.toThrow('Account not found.')
  })

  it('should throw an error if account is already deleted', async () => {
    await useCase.execute(ACCOUNT_ID, USER_ID)
    const rejects = await expect(useCase.execute(ACCOUNT_ID, USER_ID)).rejects

    rejects.toThrow(NotFoundException)
    rejects.toThrow('Account not found.')
  })
})
