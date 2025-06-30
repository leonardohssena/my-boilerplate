import { UnauthorizedException } from '@nestjs/common'

import { JwtPayload } from '@infra/auth/interfaces/jwt.interface'

export default function validateAccountAccess(accountId: string, roles: string[], user: JwtPayload) {
  const userRoles = user.roles || []

  if (userRoles.includes('admin')) {
    return true
  }

  const accountRoles = user.app_metadata?.accountRoles || []
  const userAccountRole = accountRoles.find(
    accountRole => accountRole.accountId === accountId && roles.includes(accountRole.role),
  )
  if (userAccountRole) return true

  throw new UnauthorizedException('User does not have the required role to access this account')
}
