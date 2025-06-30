import { ExecutionContext } from '@nestjs/common'
import { ACCOUNT_ID } from '@test/mocks/account.mock'
import { USER_ID } from '@test/mocks/user.mock'

import { JwtPayload } from '@infra/auth/interfaces/jwt.interface'

export const JwtPayloadMock = {
  iss: '',
  sub: USER_ID,
  aud: [''],
  iat: new Date().getTime(),
  exp: new Date().getTime() + 3600,
  azp: '',
  scope: '',
  roles: ['admin'],
  app_metadata: {},
} as JwtPayload

export async function mockCanActivateAdmin(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest()
  request.auth = {
    payload: JwtPayloadMock,
  }

  return true
}

export async function mockCanActivateProfessionalManager(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest()
  request.auth = {
    payload: {
      ...JwtPayloadMock,
      roles: ['professional'],
      app_metadata: {
        accountRoles: [
          {
            accountId: ACCOUNT_ID,
            role: 'manager',
          },
        ],
      },
      accounts: [ACCOUNT_ID],
    },
  }

  return true
}

export async function mockCanActivateProfessionalViewer(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest()
  request.auth = {
    payload: {
      ...JwtPayloadMock,
      roles: ['professional'],
      app_metadata: {
        accountRoles: [
          {
            accountId: ACCOUNT_ID,
            role: 'viewer',
          },
        ],
      },
      accounts: [ACCOUNT_ID],
    },
  }

  return true
}
