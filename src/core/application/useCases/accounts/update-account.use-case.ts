import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'

import Account from '@domain/models/accounts.model'
import { IAccountsRepository } from '@domain/repositories/accounts/accounts.protocol'
import { UpdateAccountDto } from '@interfaces/dtos/accounts/request'

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountRepository: IAccountsRepository,
  ) {}

  async execute(id: string, accountData: UpdateAccountDto): Promise<Account> {
    const account = await this.accountRepository.findById(id)
    if (!account) throw new NotFoundException('Account not found.')
    const newAccount = new Account({ ...account, ...accountData })

    if (newAccount.nickname !== account.nickname) {
      const existingAccount = await this.accountRepository.findOne({ nickname: newAccount.nickname, deleted: false })
      if (existingAccount && existingAccount.id !== id) throw new ConflictException('Account already exists.')
    }

    return this.accountRepository.update(id, newAccount)
  }
}
