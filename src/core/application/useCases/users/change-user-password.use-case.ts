import { Injectable } from '@nestjs/common'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import { ChangePasswordDto } from '@interfaces/dtos/users/change-password.dto'

@Injectable()
export class ChangeUserPasswordUseCase {
  constructor(private readonly auth0Service: Auth0Service) {}

  async execute(sub: string, data: ChangePasswordDto): Promise<void> {
    await this.auth0Service.changePassword(sub, data.currentPassword, data.newPassword)
  }
}
