import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'

import authConfig from '@config/auth.config'

import { AuthorizationGuard } from './authorization.guard'

@Module({
  exports: [],
  imports: [ConfigModule.forFeature(authConfig)],
  providers: [
    AuthorizationGuard,
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AuthModule {}
