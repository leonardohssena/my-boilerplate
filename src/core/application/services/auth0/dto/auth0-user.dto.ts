export class Auth0UserDto {
  created_at: string
  email: string
  email_verified: boolean
  identities: {
    connection: string
    user_id: string
    provider: string
    isSocial: boolean
  }[]
  name: string
  nickname: string
  picture: string
  updated_at: string
  user_id: string
  user_metadata: { [key: string]: unknown }
  app_metadata: { [key: string]: unknown }
  username: string
  last_ip: string
  last_login: string
  logins_count: number

  constructor(partial: Partial<Auth0UserDto> = {}) {
    Object.assign(this, partial)
  }
}
