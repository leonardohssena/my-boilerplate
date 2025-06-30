import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACCOUNT_DTO_OBJECT, ACCOUNT_ID, ACCOUNT_OBJECT } from '@test/mocks/account.mock'
import { mockCanActivateAdmin, mockCanActivateProfessionalManager } from '@test/mocks/auth.guard.mock'
import { AppModule } from 'app.module'
import { instanceToPlain } from 'class-transformer'
import { ObjectId } from 'mongodb'
import request from 'supertest'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { AuthorizationGuard } from '@infra/auth/authorization.guard'
import { PrismaService } from '@infra/database/prisma/prisma.service'

describe('GetAccountByIdEntrypoint', () => {
  let app: INestApplication
  let prisma: PrismaService
  let auth0Service: Auth0Service

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Auth0Service)
      .useValue({ includeAccountToUser: jest.fn() })
      .compile()

    auth0Service = moduleRef.get<Auth0Service>(Auth0Service)
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
    ;(auth0Service.includeAccountToUser as jest.Mock).mockResolvedValue(void 0)

    await prisma.account.deleteMany()
    await prisma.account.create({ data: ACCOUNT_OBJECT })
  })

  beforeEach(async () => {
    jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateAdmin)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Success', () => {
    it('/GET api/accounts/:id', async () => {
      const response = await request(app.getHttpServer()).get(`/api/accounts/${ACCOUNT_ID}`)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toEqual(instanceToPlain(ACCOUNT_DTO_OBJECT))
    })
  })

  describe('Errors', () => {
    it('/GET api/accounts/:id - Account not found', async () => {
      const response = await request(app.getHttpServer()).get(`/api/accounts/${new ObjectId().toString()}`)

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND)
      expect(response.body.message).toBe('Account not found.')
    })
  })

  describe('Professional Access', () => {
    beforeEach(async () => {
      jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateProfessionalManager)
    })

    it('/GET api/accounts/:id', async () => {
      const response = await request(app.getHttpServer()).get(`/api/accounts/${ACCOUNT_ID}`)

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toEqual(instanceToPlain(ACCOUNT_DTO_OBJECT))
    })

    it('/GET api/accounts/:id - Unauthorized', async () => {
      const response = await request(app.getHttpServer()).get(`/api/accounts/${new ObjectId().toString()}`)

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED)
      expect(response.body.message).toBe('User does not have the required role to access this account')
    })
  })
})
