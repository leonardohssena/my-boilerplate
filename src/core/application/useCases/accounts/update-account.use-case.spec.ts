import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACCOUNT_ID, ACCOUNT_OBJECT, createAccountMock } from '@test/mocks/account.mock'
import { InMemoryAccountRepository } from '@test/repositories/in-memory-account.repository'
import { ObjectId } from 'mongodb'

import { UpdateAccountUseCase } from '@application/useCases/accounts/update-account.use-case'

describe('UpdateAccountUseCase', () => {
  let useCase: UpdateAccountUseCase
  let accountRepository: InMemoryAccountRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateAccountUseCase,
        InMemoryAccountRepository,
        {
          provide: 'IAccountsRepository',
          useExisting: InMemoryAccountRepository,
        },
      ],
    }).compile()

    accountRepository = moduleRef.get<InMemoryAccountRepository>(InMemoryAccountRepository)
    useCase = moduleRef.get<UpdateAccountUseCase>(UpdateAccountUseCase)
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

  describe('Update Account', () => {
    it('should update an account', async () => {
      const account = await useCase.execute(ACCOUNT_ID, {
        name: 'New name',
        nickname: 'new-nickname',
      })

      expect(account.name).toBe('New name')
      expect(account.nickname).toBe('new-nickname')
      expect(accountRepository.items[0]).toMatchObject({
        name: 'New name',
        nickname: 'new-nickname',
      })
    })

    it('should update just name', async () => {
      const account = await useCase.execute(ACCOUNT_ID, {
        name: 'New name',
      })

      expect(account.name).toBe('New name')
      expect(account.nickname).toBe(ACCOUNT_OBJECT.nickname)
      expect(accountRepository.items[0]).toMatchObject({
        name: 'New name',
        nickname: ACCOUNT_OBJECT.nickname,
      })
    })

    it('should update just nickname', async () => {
      const account = await useCase.execute(ACCOUNT_ID, {
        nickname: 'new-nickname',
      })

      expect(account.name).toBe(ACCOUNT_OBJECT.name)
      expect(account.nickname).toBe('new-nickname')
      expect(accountRepository.items[0]).toMatchObject({
        name: ACCOUNT_OBJECT.name,
        nickname: 'new-nickname',
      })
    })
  })

  describe('Errors', () => {
    it('should throw an error if account is not found', async () => {
      const rejects = await expect(useCase.execute(new ObjectId().toString(), {})).rejects

      rejects.toThrow(NotFoundException)
      rejects.toThrow('Account not found.')
    })

    it('should throw an error if nickname already exists', async () => {
      await accountRepository.create(createAccountMock({ nickname: 'new-nickname' }))
      const rejects = await expect(useCase.execute(ACCOUNT_ID, { nickname: 'new-nickname' })).rejects

      rejects.toThrow(ConflictException)
      rejects.toThrow('Account already exists.')
    })
  })
})
