import { Test } from '@nestjs/testing'
import { ACCOUNT_DTO_OBJECT, ACCOUNT_ID, ACCOUNT_OBJECT } from '@test/mocks/account.mock'
import { JwtPayloadMock } from '@test/mocks/auth.guard.mock'

import {
  CreateAccountUseCase,
  GetAccountByIdUseCase,
  GetManyAccountsUseCase,
  SoftDeleteAccountUseCase,
  UpdateAccountUseCase,
} from '@application/useCases/accounts'
import { AccountsController } from '@interfaces/controllers/accounts.controller'
import { CreateAccountDto } from '@interfaces/dtos/accounts/request'

describe('AccountsController', () => {
  let controller: AccountsController
  let getManyAccountsUseCase: GetManyAccountsUseCase
  let getAccountByIdUseCase: GetAccountByIdUseCase
  let createAccountUseCase: CreateAccountUseCase
  let updateAccountUseCase: UpdateAccountUseCase
  let softDeleteAccountUseCase: SoftDeleteAccountUseCase

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: GetManyAccountsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAccountByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CreateAccountUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateAccountUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: SoftDeleteAccountUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = moduleRef.get<AccountsController>(AccountsController)
    getManyAccountsUseCase = moduleRef.get<GetManyAccountsUseCase>(GetManyAccountsUseCase)
    getAccountByIdUseCase = moduleRef.get<GetAccountByIdUseCase>(GetAccountByIdUseCase)
    createAccountUseCase = moduleRef.get<CreateAccountUseCase>(CreateAccountUseCase)
    updateAccountUseCase = moduleRef.get<UpdateAccountUseCase>(UpdateAccountUseCase)
    softDeleteAccountUseCase = moduleRef.get<SoftDeleteAccountUseCase>(SoftDeleteAccountUseCase)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('Method getMany', () => {
    it('should have a getMany method', () => {
      expect(controller.getMany).toBeDefined()
    })

    it('should return an array of accounts', async () => {
      ;(getManyAccountsUseCase.execute as jest.Mock).mockResolvedValue([ACCOUNT_OBJECT])

      const accounts = await controller.getMany({ limit: 10, page: 1 }, { auth: { payload: JwtPayloadMock } })
      expect(accounts).toEqual([ACCOUNT_DTO_OBJECT])
    })
  })

  describe('Method getOne', () => {
    it('should have a getOne method', () => {
      expect(controller.getOne).toBeDefined()
    })

    it('should return an account', async () => {
      ;(getAccountByIdUseCase.execute as jest.Mock).mockResolvedValue(ACCOUNT_OBJECT)

      const account = await controller.getOne(ACCOUNT_ID)
      expect(account).toEqual(ACCOUNT_DTO_OBJECT)
    })
  })

  describe('Method create', () => {
    it('should have a create method', () => {
      expect(controller.create).toBeDefined()
    })

    it('should create an account', async () => {
      ;(createAccountUseCase.execute as jest.Mock).mockResolvedValue(ACCOUNT_OBJECT)

      const account = await controller.create(
        {
          name: ACCOUNT_OBJECT.name,
          nickname: ACCOUNT_OBJECT.nickname,
          picture: ACCOUNT_OBJECT.picture,
        } as CreateAccountDto,
        { auth: { payload: JwtPayloadMock } },
      )
      expect(account).toEqual(ACCOUNT_DTO_OBJECT)
    })
  })

  describe('Method update', () => {
    it('should have a update method', () => {
      expect(controller.update).toBeDefined()
    })

    it('should update an account', async () => {
      ;(updateAccountUseCase.execute as jest.Mock).mockResolvedValue(ACCOUNT_OBJECT)

      const account = await controller.update(ACCOUNT_ID, {
        name: ACCOUNT_OBJECT.name,
        nickname: ACCOUNT_OBJECT.nickname,
        picture: ACCOUNT_OBJECT.picture,
      })
      expect(account).toEqual(ACCOUNT_DTO_OBJECT)
    })
  })

  describe('Method softDelete', () => {
    it('should have a softDelete method', () => {
      expect(controller.softDelete).toBeDefined()
    })

    it('should soft delete an account', async () => {
      ;(softDeleteAccountUseCase.execute as jest.Mock).mockResolvedValue(void 0)

      await controller.softDelete(ACCOUNT_ID, { auth: { payload: JwtPayloadMock } })
      expect(softDeleteAccountUseCase.execute).toHaveBeenCalledWith(ACCOUNT_ID, JwtPayloadMock.sub)
    })
  })
})
