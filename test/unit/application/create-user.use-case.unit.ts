import { ConflictException } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { CreateUserUseCase } from '@application/useCases/users'
import { IUsersRepository } from '@domain/repositories/users/users.protocol'

import { USER_OBJECT } from '../../jest.mocks'

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase
  let usersRepository: IUsersRepository

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: IUsersRepository,
          useFactory: () => ({
            create: jest.fn(),
            findOne: jest.fn(),
          }),
        },
      ],
    }).compile()

    useCase = moduleRef.get<CreateUserUseCase>(CreateUserUseCase)
    usersRepository = moduleRef.get<IUsersRepository>(IUsersRepository)
  })

  it('should be defined', () => {
    expect(useCase).toBeDefined()
  })

  it('should have a execute method', () => {
    expect(useCase.execute).toBeDefined()
  })

  it('should return an user', async () => {
    ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)
    ;(usersRepository.create as jest.Mock).mockResolvedValue(USER_OBJECT)

    const result = await useCase.execute(USER_OBJECT)
    expect(result).toEqual(USER_OBJECT)
  })

  it('should throw a ConflictException if the user already exists', async () => {
    ;(usersRepository.findOne as jest.Mock).mockResolvedValue(USER_OBJECT)

    await expect(useCase.execute(USER_OBJECT)).rejects.toThrow(ConflictException)
  })
})