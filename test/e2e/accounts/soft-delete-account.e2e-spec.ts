import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACCOUNT_ID, ACCOUNT_OBJECT } from '@test/mocks/account.mock'
import {
  mockCanActivateAdmin,
  mockCanActivateProfessionalManager,
  mockCanActivateProfessionalViewer,
} from '@test/mocks/auth.guard.mock'
import { USER_ID } from '@test/mocks/user.mock'
import { AppModule } from 'app.module'
import { ObjectId } from 'mongodb'
import request from 'supertest'

import { AuthorizationGuard } from '@infra/auth/authorization.guard'
import { PrismaService } from '@infra/database/prisma/prisma.service'

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
    it('/DELETE /api/accounts/:id', async () => {
      const response = await request(app.getHttpServer()).delete(`/api/accounts/${ACCOUNT_ID}`)

      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          id: ACCOUNT_ID,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
      expect(accountOnDatabase.deletedBy).toBeTruthy()
      expect(accountOnDatabase.deleted).toBe(true)
      expect(accountOnDatabase.deletedBy.id).toBe(USER_ID)
      expect(accountOnDatabase.deletedBy.deletedAt).not.toBeNull()
    })
  })

  describe('Errors', () => {
    it('/DELETE /api/accounts/:id - Account not found', async () => {
      const response = await request(app.getHttpServer()).delete(`/api/accounts/${new ObjectId().toString()}`)

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND)
      expect(response.body.message).toBe('Account not found.')
    })

    it('/DELETE /api/accounts/:id - Account already deleted', async () => {
      await prisma.account.update({
        where: {
          id: ACCOUNT_ID,
        },
        data: {
          deleted: true,
        },
      })

      const response = await request(app.getHttpServer()).delete(`/api/accounts/${ACCOUNT_ID}`)

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND)
      expect(response.body.message).toBe('Account not found.')
    })
  })

  describe('Professional Access', () => {
    beforeEach(async () => {
      jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateProfessionalManager)
    })

    it('/DELETE /api/accounts/:id', async () => {
      const response = await request(app.getHttpServer()).delete(`/api/accounts/${ACCOUNT_ID}`)

      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          id: ACCOUNT_ID,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
      expect(accountOnDatabase.deletedBy).toBeTruthy()
      expect(accountOnDatabase.deleted).toBe(true)
      expect(accountOnDatabase.deletedBy.id).toBe(USER_ID)
      expect(accountOnDatabase.deletedBy.deletedAt).not.toBeNull()
    })

    it('/DELETE /api/accounts/:id - Unauthorized', async () => {
      const response = await request(app.getHttpServer()).delete(`/api/accounts/${new ObjectId().toString()}`)

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      expect(response.body.message).toBe('User does not have the required role to access this account')
    })

    it('/DELETE /api/accounts/:id - Unauthorized - Viewer Access', async () => {
      jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateProfessionalViewer)

      const response = await request(app.getHttpServer()).delete(`/api/accounts/${ACCOUNT_ID}`)

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      expect(response.body.message).toBe('User does not have the required role to access this account')
    })
  })
})
