import { faker } from '@faker-js/faker'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACCOUNT_ID, ACCOUNT_OBJECT, createAccountMock } from '@test/mocks/account.mock'
import {
  mockCanActivateAdmin,
  mockCanActivateProfessionalManager,
  mockCanActivateProfessionalViewer,
} from '@test/mocks/auth.guard.mock'
import { AppModule } from 'app.module'
import { ObjectId } from 'mongodb'
import request from 'supertest'

import { AuthorizationGuard } from '@infra/auth/authorization.guard'
import { PrismaService } from '@infra/database/prisma/prisma.service'
import removeSpaces from '@shared/helpers/string-remove-spaces.helper'

describe('UpdateAccountEntrypoint', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    prisma = moduleRef.get<PrismaService>(PrismaService)
    app = moduleRef.createNestApplication({ logger: false })
    app.setGlobalPrefix('api')
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    )
    await app.init()
  })

  beforeEach(async () => {
    jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateAdmin)
    await prisma.account.deleteMany()
    await prisma.account.create({ data: ACCOUNT_OBJECT })
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Success', () => {
    it('/PATCH api/accounts/:id', async () => {
      const name = faker.company.name()
      const newAccount = {
        name,
        nickname: removeSpaces(name).toLocaleLowerCase(),
        picture: faker.image.avatar(),
      }
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toMatchObject(newAccount)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          name: newAccount.name,
          nickname: newAccount.nickname,
          picture: newAccount.picture,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
    })

    it('/PATCH api/accounts/:id - Without picture', async () => {
      const name = faker.company.name()
      const newAccount = {
        name,
        nickname: removeSpaces(name).toLocaleLowerCase(),
      }
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toMatchObject(newAccount)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          name: newAccount.name,
          nickname: newAccount.nickname,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
      expect(accountOnDatabase.picture).toBe(ACCOUNT_OBJECT.picture)
    })

    it('/PATCH api/accounts/:id - Without name', async () => {
      const name = faker.company.name()
      const newAccount = {
        nickname: removeSpaces(name).toLocaleLowerCase(),
        picture: faker.image.avatar(),
      }
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toMatchObject(newAccount)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          nickname: newAccount.nickname,
          picture: newAccount.picture,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
      expect(accountOnDatabase.name).toBe(ACCOUNT_OBJECT.name)
    })

    it('/PATCH api/accounts/:id - Without nickname', async () => {
      const name = faker.company.name()
      const newAccount = {
        name,
        picture: faker.image.avatar(),
      }
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toMatchObject(newAccount)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          name: newAccount.name,
          picture: newAccount.picture,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
      expect(accountOnDatabase.nickname).toBe(ACCOUNT_OBJECT.nickname)
    })

    it('/PATCH api/accounts/:id - Just name', async () => {
      const name = faker.company.name()
      const newAccount = {
        name,
      }
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toMatchObject(newAccount)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          name: newAccount.name,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
      expect(accountOnDatabase.nickname).toBe(ACCOUNT_OBJECT.nickname)
      expect(accountOnDatabase.picture).toBe(ACCOUNT_OBJECT.picture)
    })

    it('/PATCH api/accounts/:id - Just nickname', async () => {
      const name = faker.company.name()
      const newAccount = {
        nickname: removeSpaces(name).toLocaleLowerCase(),
      }
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toMatchObject(newAccount)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          nickname: newAccount.nickname,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
      expect(accountOnDatabase.name).toBe(ACCOUNT_OBJECT.name)
      expect(accountOnDatabase.picture).toBe(ACCOUNT_OBJECT.picture)
    })

    it('/PATCH api/accounts/:id - Just picture', async () => {
      const newAccount = {
        picture: faker.image.avatar(),
      }
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toMatchObject(newAccount)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          picture: newAccount.picture,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
      expect(accountOnDatabase.name).toBe(ACCOUNT_OBJECT.name)
      expect(accountOnDatabase.nickname).toBe(ACCOUNT_OBJECT.nickname)
    })
  })

  describe('Errors', () => {
    it('/PATCH api/accounts/:id - Invalid name', async () => {
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send({
        name: '',
      })

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(response.body.message).toBe('name should not be empty')
    })

    it('/PATCH api/accounts/:id - Invalid nickname', async () => {
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send({
        nickname: '',
      })

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(response.body.message).toBe('nickname should not be empty')
    })

    it('/PATCH api/accounts/:id - Invalid picture', async () => {
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send({
        picture: '',
      })

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(response.body.message).toBe('picture must be a URL address')
    })

    it('/PATCH api/accounts/:id - Account not found', async () => {
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${new ObjectId().toString()}`).send({})

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND)
      expect(response.body.message).toBe('Account not found.')
    })

    it('/PATCH api/accounts/:id - Account already exists', async () => {
      const accountMock = createAccountMock()
      await prisma.account.create({ data: accountMock })
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send({
        nickname: accountMock.nickname,
      })

      expect(response.statusCode).toBe(HttpStatus.CONFLICT)
      expect(response.body.message).toBe('Account already exists.')
    })
  })

  describe('Professional Access', () => {
    beforeEach(async () => {
      jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateProfessionalManager)
    })

    it('/PATCH api/accounts/:id', async () => {
      const name = faker.company.name()
      const newAccount = {
        name,
      }
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toMatchObject(newAccount)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          name: newAccount.name,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
      expect(accountOnDatabase.name).toBe(newAccount.name)
      expect(accountOnDatabase.nickname).toBe(ACCOUNT_OBJECT.nickname)
      expect(accountOnDatabase.picture).toBe(ACCOUNT_OBJECT.picture)
    })

    it('/PATCH api/accounts/:id - Unauthorized', async () => {
      const name = faker.company.name()
      const newAccount = {
        name,
      }
      const response = await request(app.getHttpServer())
        .patch(`/api/accounts/${new ObjectId().toString()}`)
        .send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      expect(response.body.message).toBe('User does not have the required role to access this account')
    })

    it('/PATCH api/accounts/:id - Unauthorized - Viewer Access', async () => {
      jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateProfessionalViewer)

      const name = faker.company.name()
      const newAccount = {
        name,
      }
      const response = await request(app.getHttpServer()).patch(`/api/accounts/${ACCOUNT_ID}`).send(newAccount)

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      expect(response.body.message).toBe('User does not have the required role to access this account')
    })
  })
})
