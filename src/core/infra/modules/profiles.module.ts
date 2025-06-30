import { Module } from '@nestjs/common'

import { Auth0Module } from '@application/services/auth0/auth0.module'
import { ChangeUserPasswordUseCase, GetUserInfoUseCase, UpdateUserUseCase } from '@application/useCases/users'
import { ProfilesController } from '@interfaces/controllers/profiles.controller'

@Module({
  controllers: [ProfilesController],
  imports: [Auth0Module],
  providers: [GetUserInfoUseCase, UpdateUserUseCase, ChangeUserPasswordUseCase],
})
export class ProfilesModule {}
