import { faker } from '@faker-js/faker'
import { Test } from '@nestjs/testing'
import { USER_DTO_OBJECT, USER_ID, USER_OBJECT } from '@test/mocks/user.mock'

import { ChangeUserPasswordUseCase, GetUserInfoUseCase, UpdateUserUseCase } from '@application/useCases/users'
import { ProfilesController } from '@interfaces/controllers/profiles.controller'

describe('ProfilesController', () => {
  let controller: ProfilesController
  let getUserInfoUseCase: GetUserInfoUseCase
  let updateUserUseCase: UpdateUserUseCase
  let changeUserPasswordUseCase: ChangeUserPasswordUseCase

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: GetUserInfoUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ChangeUserPasswordUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = moduleRef.get<ProfilesController>(ProfilesController)
    getUserInfoUseCase = moduleRef.get<GetUserInfoUseCase>(GetUserInfoUseCase)
    updateUserUseCase = moduleRef.get<UpdateUserUseCase>(UpdateUserUseCase)
    changeUserPasswordUseCase = moduleRef.get<ChangeUserPasswordUseCase>(ChangeUserPasswordUseCase)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('Method findOne', () => {
    it('should have a findOne method', () => {
      expect(controller.findOne).toBeDefined()
    })

    it('should return an user', async () => {
      ;(getUserInfoUseCase.execute as jest.Mock).mockResolvedValue(USER_OBJECT)
      const user = await controller.findOne({ auth: { payload: { sub: USER_ID } } })
      expect(user).toEqual(USER_DTO_OBJECT)
    })
  })

  describe('Method update', () => {
    it('should have a update method', () => {
      expect(controller.update).toBeDefined()
    })

    it('should update an user', async () => {
      ;(updateUserUseCase.execute as jest.Mock).mockResolvedValue(USER_OBJECT)
      const user = await controller.update(
        { name: faker.person.fullName(), position: faker.person.jobTitle() },
        { auth: { payload: { sub: USER_ID } } },
      )
      expect(user).toEqual(USER_DTO_OBJECT)
    })
  })

  describe('Method updatePassword', () => {
    it('should have a updatePassword method', () => {
      expect(controller.updatePassword).toBeDefined()
    })

    it('should update an user password', async () => {
      ;(changeUserPasswordUseCase.execute as jest.Mock).mockResolvedValue(USER_OBJECT)
      await expect(
        controller.updatePassword(
          {
            currentPassword: faker.internet.password(),
            newPassword: faker.internet.password(),
          },
          { auth: { payload: { sub: USER_ID } } },
        ),
      ).resolves.not.toThrow()
    })
  })
})
