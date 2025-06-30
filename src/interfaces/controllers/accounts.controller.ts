import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import {
  CreateAccountUseCase,
  GetAccountByIdUseCase,
  GetManyAccountsUseCase,
  SoftDeleteAccountUseCase,
  UpdateAccountUseCase,
} from '@application/useCases/accounts'
import { AccountGuard } from '@infra/auth/account.guard'
import { FieldRoles, Fields } from '@infra/auth/interfaces/fields'
import { CreateAccountDto, GetManyAccountsDto, UpdateAccountDto } from '@interfaces/dtos/accounts/request'
import { AccountDto } from '@interfaces/dtos/accounts/response'

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly getManyAccountsUseCase: GetManyAccountsUseCase,
    private readonly getAccountByIdUseCase: GetAccountByIdUseCase,
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly softDeleteAccountUseCase: SoftDeleteAccountUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get many accounts' })
  @ApiOkResponse({
    type: AccountDto,
  })
  async getMany(@Query() query: GetManyAccountsDto, @Request() req): Promise<AccountDto[]> {
    const accessAccounts = req.auth.payload.accounts
    const accounts = await this.getManyAccountsUseCase.execute(query, accessAccounts)
    return AccountDto.toViewModel(accounts) as AccountDto[]
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create account' })
  @ApiOkResponse({
    type: AccountDto,
  })
  async create(@Body() data: CreateAccountDto, @Request() req): Promise<AccountDto> {
    const account = await this.createAccountUseCase.execute(data, req.auth.payload.sub)
    return AccountDto.toViewModel(account) as AccountDto
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by id' })
  @ApiOkResponse({
    type: AccountDto,
  })
  @UseGuards(AccountGuard)
  @Fields('params', 'id', FieldRoles.VIEWER)
  async getOne(@Param('id') id: string): Promise<AccountDto> {
    const account = await this.getAccountByIdUseCase.execute(id)
    return AccountDto.toViewModel(account) as AccountDto
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account by id' })
  @ApiOkResponse({
    type: AccountDto,
  })
  @UseGuards(AccountGuard)
  @Fields('params', 'id', FieldRoles.MANAGER)
  async update(@Param('id') id: string, @Body() data: UpdateAccountDto): Promise<AccountDto> {
    const account = await this.updateAccountUseCase.execute(id, data)
    return AccountDto.toViewModel(account) as AccountDto
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete account by id' })
  @ApiOkResponse({
    type: AccountDto,
  })
  @UseGuards(AccountGuard)
  @Fields('params', 'id', FieldRoles.MANAGER)
  async softDelete(@Param('id') id: string, @Request() req): Promise<void> {
    await this.softDeleteAccountUseCase.execute(id, req.auth.payload.sub)
  }
}
