import { ConflictException, Inject, Injectable } from '@nestjs/common'

import { Auth0Service } from '@application/services/auth0/auth0.service'
import Account from '@domain/models/accounts.model'
import { IAccountsRepository } from '@domain/repositories/accounts/accounts.protocol'
import { CreateAccountDto } from '@interfaces/dtos/accounts/request'

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountRepository: IAccountsRepository,
    private readonly auth0Service: Auth0Service,
  ) {}

  async execute(accountData: CreateAccountDto, sub: string): Promise<Account> {
    const account = new Account(accountData)
    const existingAccount = await this.accountRepository.findOne({ nickname: account.nickname, deleted: false })
    if (existingAccount) throw new ConflictException('Account already exists.')

    const newAccount = await this.accountRepository.create(account)
    await this.auth0Service.includeAccountToUser(sub, newAccount.id, 'manager')
    return newAccount
  }
}
