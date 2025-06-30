import { Module } from '@nestjs/common'

import { Auth0Module } from '@application/services/auth0/auth0.module'
import {
  CreateAccountUseCase,
  GetAccountByIdUseCase,
  GetManyAccountsUseCase,
  SoftDeleteAccountUseCase,
  UpdateAccountUseCase,
} from '@application/useCases/accounts'
import { AccountsRepository } from '@domain/repositories/accounts/accounts.repository'
import { AccountsController } from '@interfaces/controllers/accounts.controller'

@Module({
  controllers: [AccountsController],
  imports: [Auth0Module],
  providers: [
    GetManyAccountsUseCase,
    GetAccountByIdUseCase,
    CreateAccountUseCase,
    UpdateAccountUseCase,
    SoftDeleteAccountUseCase,
    {
      provide: 'IAccountsRepository',
      useClass: AccountsRepository,
    },
  ],
})
export class AccountsModule {}
