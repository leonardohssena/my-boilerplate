import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ACCOUNT_ID, ACCOUNT_OBJECT, createAccountMock } from '@test/mocks/account.mock'
import { mockCanActivateAdmin, mockCanActivateProfessionalManager } from '@test/mocks/auth.guard.mock'
import { AppModule } from 'app.module'
import request from 'supertest'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { AuthorizationGuard } from '@infra/auth/authorization.guard'
import { PrismaService } from '@infra/database/prisma/prisma.service'

describe('GetManyAccountsEntrypoint', () => {
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

    const mockAccounts = [ACCOUNT_OBJECT]
    for (let i = 0; i < 19; i++) {
      mockAccounts.push(createAccountMock())
    }

    await prisma.account.deleteMany()
    await prisma.account.createMany({ data: mockAccounts })
  })

  beforeEach(async () => {
    jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateAdmin)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Filters', () => {
    it('/GET api/accounts - Filtered by name', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 1,
        limit: 10,
        name: ACCOUNT_OBJECT.name,
      })

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe(ACCOUNT_OBJECT.name)
    })

    it('/GET api/accounts - Filtered by partial name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/accounts')
        .query({
          page: 1,
          limit: 10,
          name: ACCOUNT_OBJECT.name.slice(0, 3),
        })

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe(ACCOUNT_OBJECT.name)
    })
  })

  describe('Order By', () => {
    it('/GET api/accounts - Order by name', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 1,
        limit: 10,
        orderField: 'name',
        orderDirection: 'asc',
      })

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toHaveLength(10)
      const names = response.body.map(account => account.name)
      expect(names).toEqual(names.sort())
    })

    it('/GET api/accounts - Order by name in descending order', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 1,
        limit: 10,
        orderField: 'name',
        orderDirection: 'desc',
      })

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toHaveLength(10)
      const names = response.body.map(account => account.name)
      expect(names).toEqual(names.sort().reverse())
    })
  })

  describe('Pagination', () => {
    it('/GET api/accounts - Page 1', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 1,
        limit: 10,
      })

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toHaveLength(10)
    })

    it('/GET api/accounts - Page 3', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 3,
        limit: 10,
      })

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toHaveLength(0)
    })

    it('/GET api/accounts - Page 1 - Limit 5', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 1,
        limit: 5,
      })

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toHaveLength(5)
    })
  })

  describe('Errors', () => {
    it('/GET api/accounts - Invalid page', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 0,
        limit: 10,
      })

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST)
    })

    it('/GET api/accounts - Invalid limit', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 1,
        limit: 0,
      })

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST)
    })

    it('/GET api/accounts - Invalid order direction', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 1,
        limit: 10,
        orderField: 'name',
        orderDirection: 'invalid',
      })

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST)
    })
  })

  describe('Professional Access', () => {
    beforeEach(async () => {
      jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateProfessionalManager)
    })

    it('/GET api/accounts - Filtered by access accounts', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 1,
        limit: 10,
      })

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].id).toBe(ACCOUNT_ID)
    })

    it('/GET api/accounts - Filtered by access accounts and name', async () => {
      const response = await request(app.getHttpServer()).get('/api/accounts').query({
        page: 1,
        limit: 10,
        name: ACCOUNT_OBJECT.name,
      })

      expect(response.statusCode).toBe(HttpStatus.OK)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe(ACCOUNT_OBJECT.name)
    })
  })
})
