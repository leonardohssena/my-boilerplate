import { faker } from '@faker-js/faker'
import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AUTH0_USER_OBJECT, USER_ID, USER_OBJECT } from '@test/mocks/user.mock'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { UpdateUserUseCase } from '@application/useCases/users'

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase
  let auth0Service: Auth0Service

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: Auth0Service,
          useValue: {
            getUserByAuth0Id: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = moduleRef.get<UpdateUserUseCase>(UpdateUserUseCase)
    auth0Service = moduleRef.get<Auth0Service>(Auth0Service)
  })

  it('should be defined', () => {
    expect(useCase).toBeDefined()
  })

  it('should have a execute method', () => {
    expect(useCase.execute).toBeDefined()
  })

  it('should update an user', async () => {
    const newUserData = {
      name: faker.person.fullName(),
      position: faker.person.jobTitle(),
    }

    ;(auth0Service.getUserByAuth0Id as jest.Mock).mockResolvedValue(AUTH0_USER_OBJECT)
    ;(auth0Service.updateUser as jest.Mock).mockResolvedValue({
      ...AUTH0_USER_OBJECT,
      name: newUserData.name,
      user_metadata: {
        ...AUTH0_USER_OBJECT.user_metadata,
        position: newUserData.position,
      },
    })

    const result = await useCase.execute(USER_ID, newUserData)
    expect(result).toEqual({ ...USER_OBJECT, ...newUserData })
  })

  it('should throw a NotFoundException if the user does not exist', async () => {
    ;(auth0Service.getUserByAuth0Id as jest.Mock).mockResolvedValue(null)

    await expect(
      useCase.execute(AUTH0_USER_OBJECT.user_id, {
        name: faker.person.fullName(),
        position: faker.person.jobTitle(),
      }),
    ).rejects.toThrow(NotFoundException)
  })
})
