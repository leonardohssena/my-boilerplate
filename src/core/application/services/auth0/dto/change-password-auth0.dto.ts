export class Auth0LoginDto {
  username: string
  password: string
  audience: string
  client_id: string
  client_secret: string
  grant_type = 'password'
  realm = 'Username-Password-Authentication'

  constructor(partial: Partial<Auth0LoginDto>) {
    Object.assign(this, partial)
  }
}
