import { Injectable } from '@nestjs/common'

import Account from '@domain/models/accounts.model'
import { PrismaService } from '@infra/database/prisma/prisma.service'

import { BaseRepository } from '../base.repository'

import { IAccountsRepository } from './accounts.protocol'

@Injectable()
export class AccountsRepository extends BaseRepository<Account> implements IAccountsRepository {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma.account)
  }
}
