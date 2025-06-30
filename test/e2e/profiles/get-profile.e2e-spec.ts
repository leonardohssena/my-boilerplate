import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from 'app.module'
import { instanceToPlain } from 'class-transformer'
import request from 'supertest'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { AuthorizationGuard } from '@infra/auth/authorization.guard'

import { mockCanActivateAdmin } from '../../mocks/auth.guard.mock'
import { AUTH0_USER_OBJECT, USER_DTO_OBJECT } from '../../mocks/user.mock'

describe('GetProfileEntrypoint', () => {
  let app: INestApplication
  let auth0Service: Auth0Service

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Auth0Service)
      .useValue({ getUserByAuth0Id: jest.fn() })
      .compile()

    auth0Service = moduleRef.get<Auth0Service>(Auth0Service)
    app = moduleRef.createNestApplication({ logger: false })
    app.setGlobalPrefix('api')
    await app.init()

    jest.spyOn(AuthorizationGuard.prototype, 'canActivate').mockImplementation(mockCanActivateAdmin)
    ;(auth0Service.getUserByAuth0Id as jest.Mock).mockResolvedValue(AUTH0_USER_OBJECT)
  })

  afterAll(async () => {
    await app.close()
  })

  it('/GET api/profiles', async () => {
    const response = await request(app.getHttpServer()).get('/api/profiles')

    expect(response.statusCode).toBe(HttpStatus.OK)
    expect(response.body).toEqual(instanceToPlain(USER_DTO_OBJECT))
  })

  it('/GET api/profiles - User not found', async () => {
    ;(auth0Service.getUserByAuth0Id as jest.Mock).mockResolvedValue(null)

    const response = await request(app.getHttpServer()).get('/api/profiles')

    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND)
    expect(response.body).toEqual(expect.objectContaining({ message: 'The user has not found.' }))
  })
})
