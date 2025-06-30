import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

import { JwtPayload } from '@infra/auth/interfaces/jwt.interface'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()

    const user = request.auth.payload as JwtPayload

    return user.roles.includes('admin')
  }
}
