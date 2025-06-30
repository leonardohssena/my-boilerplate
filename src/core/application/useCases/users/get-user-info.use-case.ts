import { Injectable, NotFoundException } from '@nestjs/common'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import User from '@domain/models/users.model'

@Injectable()
export class GetUserInfoUseCase {
  constructor(private readonly auth0Service: Auth0Service) {}

  async execute(sub: string): Promise<User> {
    const user = await this.auth0Service.getUserByAuth0Id(sub)
    if (!user) throw new NotFoundException(`The user has not found.`)
    return new User({
      id: user.user_id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      email_verified: user.email_verified,
      picture: user.picture,
      position: user.user_metadata?.position as string,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    })
  }
}
