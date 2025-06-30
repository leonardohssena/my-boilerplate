import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { FIELD_KEY, FieldType } from '@infra/auth/interfaces/fields'
import { JwtPayload } from '@infra/auth/interfaces/jwt.interface'
import { IS_PUBLIC_KEY } from '@infra/auth/interfaces/public'
import validateAccountAccess from '@infra/auth/validate-account-access'

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const user = request.auth.payload as JwtPayload
    const { location, field, roles } = this.reflector.getAllAndOverride<FieldType>(FIELD_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const accountId = request[location][field]
    validateAccountAccess(accountId, roles, user)

    return true
  }
}
