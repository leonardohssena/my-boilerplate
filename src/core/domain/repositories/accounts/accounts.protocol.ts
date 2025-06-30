import { Injectable } from '@nestjs/common'

import Account from '@domain/models/accounts.model'

import { IBaseRepository } from '../base.protocol'

@Injectable()
export abstract class IAccountsRepository extends IBaseRepository<Account> {}
