/*************  ✨ Windsurf Command 🌟  *************/
import { promisify } from 'util'

import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { auth } from 'express-oauth2-jwt-bearer'

import { IS_PUBLIC_KEY } from './interfaces/public'

@Injectable()
export class AuthorizationGuard {
  private AUTH0_DOMAIN: string
  private AUTH0_AUDIENCE: string

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.AUTH0_DOMAIN = configService.get<string>('auth.domain')
    this.AUTH0_AUDIENCE = configService.get<string>('auth.audience')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()

    await this.authenticateUser(request, response)

    const user = request.auth.payload
    const requiredRole = this.getRequiredRole(context)

    if (!requiredRole || user.roles.includes(requiredRole)) {
      return true
    }
    throw new UnauthorizedException('User does not have the required role')
  }

  private async authenticateUser(request, response) {
    const jwtCheck = promisify(
      auth({
        audience: this.AUTH0_AUDIENCE,
        issuerBaseURL: `https://${this.AUTH0_DOMAIN}`,
        tokenSigningAlg: 'RS256',
      }),
    )

    try {
      await jwtCheck(request, response)
      request.auth.payload.roles = request.auth.payload['https://system/roles']
      delete request.auth.payload['https://system/roles']
      const app_metadata = request.auth.payload['https://system/app_metadata'] || {}
      request.auth.payload.app_metadata = app_metadata
      delete request.auth.payload['https://system/app_metadata']
      request.auth.payload.accounts =
        app_metadata.accountRoles?.reduce((accountRole, acc) => [...acc, accountRole.accountId], []) || []
    } catch (error) {
      throw new UnauthorizedException(error)
    }
  }

  private getRequiredRole(context: ExecutionContext): string | undefined {
    const handler = context.getHandler()
    const role = this.reflector.get<string>('role', handler)
    return role
  }
}
