import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AUTH0_USER_OBJECT, USER_ID, USER_OBJECT } from '@test/mocks/user.mock'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { GetUserInfoUseCase } from '@application/useCases/users'

describe('GetUserInfoUseCase', () => {
  let useCase: GetUserInfoUseCase
  let auth0Service: Auth0Service

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetUserInfoUseCase,
        {
          provide: Auth0Service,
          useValue: {
            getUserByAuth0Id: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = moduleRef.get<GetUserInfoUseCase>(GetUserInfoUseCase)
    auth0Service = moduleRef.get<Auth0Service>(Auth0Service)
  })

  it('should be defined', () => {
    expect(useCase).toBeDefined()
  })

  it('should have a execute method', () => {
    expect(useCase.execute).toBeDefined()
  })

  it('should return an user', async () => {
    ;(auth0Service.getUserByAuth0Id as jest.Mock).mockResolvedValue(AUTH0_USER_OBJECT)

    const result = await useCase.execute(USER_ID)
    expect(result).toEqual(USER_OBJECT)
  })

  it('should throw a NotFoundException if the user does not exist', async () => {
    ;(auth0Service.getUserByAuth0Id as jest.Mock).mockResolvedValue(null)

    await expect(useCase.execute(AUTH0_USER_OBJECT.user_id)).rejects.toThrow(NotFoundException)
  })
})
