import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import Account from '@domain/models/accounts.model'
import { IAccountsRepository } from '@domain/repositories/accounts/accounts.protocol'

@Injectable()
export class GetAccountByIdUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountRepository: IAccountsRepository,
  ) {}

  async execute(id: string): Promise<Account> {
    const account = await this.accountRepository.findById(id)
    if (!account) throw new NotFoundException('Account not found.')
    return account
  }
}
