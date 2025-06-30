import { faker } from '@faker-js/faker'
import { Test } from '@nestjs/testing'
import { USER_ID } from '@test/mocks/user.mock'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { ChangeUserPasswordUseCase } from '@application/useCases/users'

describe('ChangeUserPasswordUseCase', () => {
  let useCase: ChangeUserPasswordUseCase
  let auth0Service: Auth0Service

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChangeUserPasswordUseCase,
        {
          provide: Auth0Service,
          useValue: {
            changePassword: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = moduleRef.get<ChangeUserPasswordUseCase>(ChangeUserPasswordUseCase)
    auth0Service = moduleRef.get<Auth0Service>(Auth0Service)
  })

  it('should be defined', () => {
    expect(useCase).toBeDefined()
  })

  it('should have a execute method', () => {
    expect(useCase.execute).toBeDefined()
  })

  it('should be success', async () => {
    ;(auth0Service.changePassword as jest.Mock).mockResolvedValue(true)

    const execute = useCase.execute(USER_ID, {
      currentPassword: faker.internet.password(),
      newPassword: faker.internet.password(),
    })
    await expect(execute).resolves.not.toThrow()
  })
})
