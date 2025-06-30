import { ExecutionContext } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'

import authConfig from '@config/auth.config'
import { AuthorizationGuard } from '@infra/auth/authorization.guard'

describe('AuthorizationGuard', () => {
  let authorizationGuard: AuthorizationGuard
  let request: Request
  let response: Response
  let context: ExecutionContext
  let reflector: Reflector

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(authConfig)],
      controllers: [],
      providers: [
        AuthorizationGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile()

    reflector = moduleRef.get<Reflector>(Reflector)
    authorizationGuard = moduleRef.get<AuthorizationGuard>(AuthorizationGuard)
    context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
      getHandler: () => {},
      getClass: () => {},
    } as ExecutionContext
  })

  it('should be defined', () => {
    expect(authorizationGuard).toBeDefined()
  })

  describe('canActivate', () => {
    it('should return true if the route is public', async () => {
      ;(reflector.getAllAndOverride as jest.Mock).mockReturnValueOnce(true)

      const result = await authorizationGuard.canActivate(context)
      expect(result).toBe(true)
    })
  })
})
