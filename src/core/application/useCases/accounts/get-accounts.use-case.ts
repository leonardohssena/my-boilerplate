import { Inject, Injectable } from '@nestjs/common'

import Account from '@domain/models/accounts.model'
import { FilterParams } from '@domain/models/base-params.model'
import { IAccountsRepository } from '@domain/repositories/accounts/accounts.protocol'
import { GetManyAccountsDto } from '@interfaces/dtos/accounts/request'

@Injectable()
export class GetManyAccountsUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountRepository: IAccountsRepository,
  ) {}

  async execute(
    { page = 1, limit = 10, name, orderField = 'name', orderDirection = 'asc' }: GetManyAccountsDto,
    accessAccounts = [],
  ): Promise<Account[]> {
    const findFilters: FilterParams<Account> = { deleted: false }
    if (name) findFilters.name = { isPartial: true, value: name }
    if (accessAccounts.length) findFilters.id = { values: accessAccounts, isList: true }

    const accounts = await this.accountRepository.findMany(
      {
        page,
        limit,
      },
      findFilters,
      {
        [orderField]: orderDirection,
      },
    )
    return accounts
  }
}
