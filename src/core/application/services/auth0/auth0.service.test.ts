import { faker } from '@faker-js/faker'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AUTH0_USER_OBJECT, USER_ID } from '@test/mocks/user.mock'

import authConfig from '@config/auth.config'
import { HttpService } from '@infra/http'

import { Auth0Service } from './auth0.service'

describe('Auth0Service', () => {
  let service: Auth0Service
  let httpService: HttpService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(authConfig)],
      providers: [
        Auth0Service,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            patch: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<Auth0Service>(Auth0Service)
    httpService = module.get<HttpService>(HttpService)
    ;(httpService.post as jest.Mock).mockResolvedValueOnce({
      access_token: 'access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    })
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Method updateUser', () => {
    it('should have a updateUser method', () => {
      expect(service.updateUser).toBeDefined()
    })

    it('should update an user', async () => {
      ;(httpService.patch as jest.Mock).mockResolvedValue(AUTH0_USER_OBJECT)

      const data = {
        name: faker.person.fullName(),
      }
      const result = await service.updateUser(USER_ID, data)
      expect(result).toEqual(AUTH0_USER_OBJECT)
      expect(httpService.patch).toHaveBeenCalledWith(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${USER_ID}`,
        data,
        {
          headers: {
            Authorization: 'Bearer access-token',
            'Content-Type': 'application/json',
          },
        },
      )
    })
  })

  describe('Method getUserByAuth0Id', () => {
    it('should have a getUserByAuth0Id method', () => {
      expect(service.getUserByAuth0Id).toBeDefined()
    })

    it('should return an user', async () => {
      ;(httpService.get as jest.Mock).mockResolvedValue(AUTH0_USER_OBJECT)

      const result = await service.getUserByAuth0Id(USER_ID)
      expect(result).toEqual(AUTH0_USER_OBJECT)
      expect(httpService.get).toHaveBeenCalledWith(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${USER_ID}`, {
        headers: {
          Authorization: 'Bearer access-token',
        },
      })
    })
  })

  describe('Method changePassword', () => {
    it('should have a changePassword method', () => {
      expect(service.changePassword).toBeDefined()
    })

    it('should change an user password', async () => {
      ;(httpService.patch as jest.Mock).mockResolvedValue(null)
      ;(httpService.get as jest.Mock).mockResolvedValue(AUTH0_USER_OBJECT)
      ;(httpService.post as jest.Mock).mockResolvedValue({
        access_token: 'user-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      })

      const result = await service.changePassword(USER_ID, 'oldpass', 'newpass')
      expect(result).toBeUndefined()
      expect(httpService.patch).toHaveBeenCalledWith(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${USER_ID}`,
        { password: 'newpass' },
        {
          headers: {
            Authorization: 'Bearer access-token',
            'Content-Type': 'application/json',
          },
        },
      )
    })
  })
})
