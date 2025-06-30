import { InMemoryBaseRepository } from '@test/repositories/in-memory-base.repository'

import Account from '@domain/models/accounts.model'
import { IAccountsRepository } from '@domain/repositories/accounts/accounts.protocol'

export class InMemoryAccountRepository extends InMemoryBaseRepository<Account> implements IAccountsRepository {}
