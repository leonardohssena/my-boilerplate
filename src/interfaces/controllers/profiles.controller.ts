import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Put, Request } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { ChangeUserPasswordUseCase, GetUserInfoUseCase, UpdateUserUseCase } from '@application/useCases/users'
import { UpdateUserDto, UserDTO } from '@interfaces/dtos/users'
import { ChangePasswordDto } from '@interfaces/dtos/users/change-password.dto'
import { BadRequestError, NotFoundError } from '@shared/errors'

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly getUserInfoUseCase: GetUserInfoUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly changeUserPasswordUseCase: ChangeUserPasswordUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ type: UserDTO })
  async findOne(@Request() req): Promise<UserDTO> {
    const user = await this.getUserInfoUseCase.execute(req.auth.payload.sub)
    return UserDTO.toViewModel(user) as UserDTO
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user' })
  @ApiOkResponse({ type: UserDTO })
  @ApiBadRequestResponse({ description: 'Invalid user data.', type: BadRequestError })
  @ApiNotFoundResponse({ description: 'User not found.', type: NotFoundError })
  async update(@Body() data: UpdateUserDto, @Request() req): Promise<UserDTO> {
    const user = await this.updateUserUseCase.execute(req.auth.payload.sub, data)
    return UserDTO.toViewModel(user) as UserDTO
  }

  @Put('/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update current user password' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ description: 'Invalid user data.', type: BadRequestError })
  @ApiNotFoundResponse({ description: 'User not found.', type: NotFoundError })
  async updatePassword(@Body() data: ChangePasswordDto, @Request() req): Promise<void> {
    const { sub } = req.auth.payload
    await this.changeUserPasswordUseCase.execute(sub, data)
  }
}
