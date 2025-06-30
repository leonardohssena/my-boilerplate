export interface AccountRole {
  accountId: string
  role: string
}
export interface JwtPayload {
  iss?: string
  sub?: string
  aud?: string[]
  iat?: number
  exp?: number
  azp?: string
  scope?: string
  roles?: string[]
  app_metadata?: {
    accountRoles?: AccountRole[]
  }
  accounts?: string[]
}
