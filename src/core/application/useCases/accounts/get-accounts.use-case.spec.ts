import { Test } from '@nestjs/testing'
import { createAccountMock } from '@test/mocks/account.mock'
import { InMemoryAccountRepository } from '@test/repositories/in-memory-account.repository'
import { ObjectId } from 'mongodb'

import { GetManyAccountsUseCase } from '@application/useCases/accounts/get-accounts.use-case'

describe('GetManyAccountsUseCase', () => {
  let useCase: GetManyAccountsUseCase
  let accountRepository: InMemoryAccountRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetManyAccountsUseCase,
        InMemoryAccountRepository,
        {
          provide: 'IAccountsRepository',
          useExisting: InMemoryAccountRepository,
        },
      ],
    }).compile()

    accountRepository = moduleRef.get<InMemoryAccountRepository>(InMemoryAccountRepository)
    useCase = moduleRef.get<GetManyAccountsUseCase>(GetManyAccountsUseCase)
  })

  it('should be defined', () => {
    expect(useCase).toBeDefined()
  })

  it('should have a execute method', () => {
    expect(useCase.execute).toBeDefined()
  })

  describe('Simple Returns', () => {
    beforeAll(() => {
      accountRepository.clear()
    })

    it('should return an empty array of accounts', async () => {
      const accounts = await useCase.execute({ page: 1, limit: 10 })
      expect(accounts).toHaveLength(0)
    })

    it('should return an array of accounts', async () => {
      await Promise.all([accountRepository.create(createAccountMock()), accountRepository.create(createAccountMock())])

      const accounts = await useCase.execute({ page: 1, limit: 10 })
      expect(accounts).toHaveLength(2)
    })
  })

  describe('Filters', () => {
    let accountTest

    beforeAll(async () => {
      accountRepository.clear()

      const [account] = await Promise.all([
        accountRepository.create(createAccountMock()),
        accountRepository.create(createAccountMock()),
        accountRepository.create(createAccountMock()),
      ])

      accountTest = account
    })

    it('should return an array of accounts filtered by name', async () => {
      const name = accountTest.name
      const accounts = await useCase.execute({ page: 1, limit: 10, name })
      expect(accounts).toHaveLength(1)
      expect(accounts[0].name).toBe(name)
    })

    it('should return an array of accounts filtered by partial name', async () => {
      const name = accountTest.name
      const accounts = await useCase.execute({
        page: 1,
        limit: 10,
        name: name.slice(0, 3),
      })
      expect(accounts).toHaveLength(1)
      expect(accounts[0].name).toBe(name)
    })

    it('should return an array of accounts filtered by access accounts', async () => {
      const accessAccounts = [accountTest.id]
      const accounts = await useCase.execute({ page: 1, limit: 10 }, accessAccounts)
      expect(accounts).toHaveLength(1)
      expect(accounts[0].name).toBe(accountTest.name)
    })

    it('should return an empty array of accounts filtered by access accounts', async () => {
      const accessAccounts = [new ObjectId().toString()]
      const accounts = await useCase.execute({ page: 1, limit: 10 }, accessAccounts)
      expect(accounts).toHaveLength(0)
    })

    it('should return an array of accounts filtered by access accounts and name', async () => {
      const accessAccounts = [accountTest.id]
      const name = accountTest.name
      const accounts = await useCase.execute({ page: 1, limit: 10, name }, accessAccounts)
      expect(accounts).toHaveLength(1)
      expect(accounts[0].name).toBe(name)
    })
  })

  describe('Order By', () => {
    beforeAll(async () => {
      accountRepository.clear()

      await Promise.all([
        accountRepository.create(createAccountMock({ name: 'B' })),
        accountRepository.create(createAccountMock({ name: 'C' })),
        accountRepository.create(createAccountMock({ name: 'A' })),
      ])
    })

    it('should return an array of accounts ordered by name', async () => {
      const accounts = await useCase.execute({ page: 1, limit: 10, orderField: 'name', orderDirection: 'asc' })
      expect(accounts).toHaveLength(3)
      expect(accounts[0].name).toBe('A')
      expect(accounts[1].name).toBe('B')
      expect(accounts[2].name).toBe('C')
    })

    it('should return an array of accounts ordered by name in descending order', async () => {
      const accounts = await useCase.execute({ page: 1, limit: 10, orderField: 'name', orderDirection: 'desc' })
      expect(accounts).toHaveLength(3)
      expect(accounts[0].name).toBe('C')
      expect(accounts[1].name).toBe('B')
      expect(accounts[2].name).toBe('A')
    })
  })

  describe('Pagination', () => {
    beforeAll(async () => {
      accountRepository.clear()

      for (let i = 0; i < 20; i++) {
        await accountRepository.create(createAccountMock())
      }
    })
    it('should return an array of accounts paginated', async () => {
      const accounts = await useCase.execute({ page: 2, limit: 10 })
      expect(accounts).toHaveLength(10)
    })

    it('should return an empty array of accounts', async () => {
      const accounts = await useCase.execute({ page: 3, limit: 10 })
      expect(accounts).toHaveLength(0)
    })

    it('should return an array of accounts with a limit of 3', async () => {
      const accounts = await useCase.execute({ page: 1, limit: 3 })
      expect(accounts).toHaveLength(3)
    })
  })
})
