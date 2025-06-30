import { Injectable, NotFoundException } from '@nestjs/common'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { UpdateAuth0UserDto } from '@application/services/auth0/dto'
import User from '@domain/models/users.model'
import { UpdateUserDto } from '@interfaces/dtos/users'

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly auth0Service: Auth0Service) {}

  async execute(sub: string, userData: UpdateUserDto): Promise<User> {
    const existingUser = await this.auth0Service.getUserByAuth0Id(sub)
    if (!existingUser) throw new NotFoundException(`The user has not found.`)

    const user_metadata = {
      ...existingUser.user_metadata,
      position: userData.position || existingUser.user_metadata?.position,
    }

    const updateAuth0UserDto = new UpdateAuth0UserDto({
      name: userData.name,
      user_metadata,
    })
    const user = await this.auth0Service.updateUser(sub, updateAuth0UserDto)

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
