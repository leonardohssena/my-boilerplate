import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { HttpService } from '@infra/http'

import { Auth0TokenDto, Auth0UserDto, CreateAuth0UserDto, UpdateAuth0UserDto } from './dto'

@Injectable()
export class Auth0Service {
  private auth0Domain
  private auth0ClientId
  private auth0ClientSecret
  private auth0Audience

  private auth0Token: string
  private tokenExpirationTime: number

  private readonly logger = new Logger(Auth0Service.name)

  constructor(
    readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.auth0Domain = configService.get<string>('auth.domain')
    this.auth0ClientId = configService.get<string>('auth.clientId')
    this.auth0ClientSecret = configService.get<string>('auth.clientSecret')
    this.auth0Audience = configService.get<string>('auth.audience')
  }

  private async initAuth0Token() {
    try {
      const auth0TokenResponse = await this.generateAuth0Token()
      const expiresIn = auth0TokenResponse.expires_in || 3600
      this.tokenExpirationTime = Date.now() + expiresIn * 1000
      this.auth0Token = `${auth0TokenResponse.token_type} ${auth0TokenResponse.access_token}`
      this.logger.log('Auth0 token generated')
    } catch (err) {
      this.logger.error(`Error generating Auth0 token: ${err.message}`, err.stack)
    }
  }

  private async generateAuth0Token(): Promise<Auth0TokenDto> {
    const url = `https://${this.auth0Domain}/oauth/token`

    const response = await this.httpService.post(
      url,
      {
        client_id: this.auth0ClientId,
        client_secret: this.auth0ClientSecret,
        audience: this.auth0Audience,
        grant_type: 'client_credentials',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response as Auth0TokenDto
  }

  private async ensureTokenIsValid(): Promise<void> {
    if (!this.auth0Token || Date.now() >= this.tokenExpirationTime) {
      this.logger.log('Auth0 token is expired or not set, generating a new one...')
      await this.initAuth0Token()
    }
  }

  async createUser(createAuth0UserDto: CreateAuth0UserDto): Promise<Auth0UserDto> {
    await this.ensureTokenIsValid()

    const url = `https://${this.auth0Domain}/api/v2/users`
    return this.httpService.post(url, createAuth0UserDto, {
      headers: {
        Authorization: this.auth0Token,
        'Content-Type': 'application/json',
      },
    })
  }

  async updateUser(auth0Id: string, updateAuth0UserDto: UpdateAuth0UserDto): Promise<Auth0UserDto> {
    await this.ensureTokenIsValid()

    const url = `https://${this.auth0Domain}/api/v2/users/${auth0Id}`
    if (updateAuth0UserDto.email && updateAuth0UserDto.username) {
      await this.httpService.patch(
        url,
        { username: updateAuth0UserDto.username },
        {
          headers: {
            Authorization: this.auth0Token,
            'Content-Type': 'application/json',
          },
        },
      )

      delete updateAuth0UserDto.username
    }
    return this.httpService.patch(url, updateAuth0UserDto, {
      headers: {
        Authorization: this.auth0Token,
        'Content-Type': 'application/json',
      },
    })
  }
}
