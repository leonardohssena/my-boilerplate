import { ConflictException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACCOUNT_OBJECT } from '@test/mocks/account.mock'
import { USER_ID } from '@test/mocks/user.mock'
import { InMemoryAccountRepository } from '@test/repositories/in-memory-account.repository'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { CreateAccountUseCase } from '@application/useCases/accounts'

describe('CreateAccountUseCase', () => {
  let useCase: CreateAccountUseCase
  let accountRepository: InMemoryAccountRepository
  let auth0Service: Auth0Service

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateAccountUseCase,
        InMemoryAccountRepository,
        {
          provide: 'IAccountsRepository',
          useExisting: InMemoryAccountRepository,
        },
        {
          provide: Auth0Service,
          useValue: {
            includeAccountToUser: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = moduleRef.get<CreateAccountUseCase>(CreateAccountUseCase)
    accountRepository = moduleRef.get<InMemoryAccountRepository>(InMemoryAccountRepository)
    auth0Service = moduleRef.get<Auth0Service>(Auth0Service)
    ;(auth0Service.includeAccountToUser as jest.Mock).mockResolvedValue(void 0)
  })

  beforeEach(() => {
    accountRepository.clear()
  })

  it('should be defined', () => {
    expect(useCase).toBeDefined()
  })

  it('should have a execute method', () => {
    expect(useCase.execute).toBeDefined()
  })

  it('should create an account', async () => {
    const account = await useCase.execute(ACCOUNT_OBJECT, USER_ID)

    expect(account).toBeDefined()
    expect(accountRepository.items).toHaveLength(1)
    expect(accountRepository.items[0]).toEqual(account)
  })

  it('should throw an error if account already exists', async () => {
    await accountRepository.create(ACCOUNT_OBJECT)

    const rejects = await expect(useCase.execute(ACCOUNT_OBJECT, USER_ID)).rejects
    rejects.toThrow(ConflictException)
    rejects.toThrow('Account already exists.')
  })
})
