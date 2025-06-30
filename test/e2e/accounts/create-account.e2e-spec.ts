import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACCOUNT_OBJECT } from '@test/mocks/account.mock'
import { mockCanActivateProfessionalManager } from '@test/mocks/auth.guard.mock'
import { AppModule } from 'app.module'
import request from 'supertest'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { AuthorizationGuard } from '@infra/auth/authorization.guard'
import { PrismaService } from '@infra/database/prisma/prisma.service'

describe('CreateAccountEntrypoint', () => {
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
  })

  beforeEach(async () => {
    jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateProfessionalManager)
    await prisma.account.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Success', () => {
    it('/POST api/accounts', async () => {
      const response = await request(app.getHttpServer()).post('/api/accounts').send({
        name: ACCOUNT_OBJECT.name,
        nickname: ACCOUNT_OBJECT.nickname,
        picture: ACCOUNT_OBJECT.picture,
      })

      expect(response.statusCode).toBe(HttpStatus.CREATED)
      expect(response.body.name).toBe(ACCOUNT_OBJECT.name)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          name: ACCOUNT_OBJECT.name,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
    })

    it('/POST api/accounts - Without picture', async () => {
      const response = await request(app.getHttpServer()).post('/api/accounts').send({
        name: ACCOUNT_OBJECT.name,
        nickname: ACCOUNT_OBJECT.nickname,
      })

      expect(response.statusCode).toBe(HttpStatus.CREATED)
      expect(response.body.name).toBe(ACCOUNT_OBJECT.name)

      const accountOnDatabase = await prisma.account.findFirst({
        where: {
          name: ACCOUNT_OBJECT.name,
        },
      })
      expect(accountOnDatabase).toBeTruthy()
    })
  })

  describe('Errors', () => {
    it('/POST api/accounts - Invalid name', async () => {
      const response = await request(app.getHttpServer()).post('/api/accounts').send({
        name: '',
        nickname: ACCOUNT_OBJECT.nickname,
        picture: ACCOUNT_OBJECT.picture,
      })

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(response.body.message).toBe('name should not be empty')
    })

    it('/POST api/accounts - Invalid nickname', async () => {
      const response = await request(app.getHttpServer()).post('/api/accounts').send({
        name: ACCOUNT_OBJECT.name,
        nickname: '',
        picture: ACCOUNT_OBJECT.picture,
      })

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST)
      expect(response.body.message).toBe('nickname should not be empty')
    })

    it('/POST api/accounts - Account already exists', async () => {
      await prisma.account.create({ data: ACCOUNT_OBJECT })

      const response = await request(app.getHttpServer()).post('/api/accounts').send({
        name: ACCOUNT_OBJECT.name,
        nickname: ACCOUNT_OBJECT.nickname,
        picture: ACCOUNT_OBJECT.picture,
      })

      expect(response.statusCode).toBe(HttpStatus.CONFLICT)
      expect(response.body.message).toBe('Account already exists.')
    })
  })
})
