import { BaseModel } from './base.model'

export default class User extends BaseModel {
  name: string
  nickname: string
  email: string
  email_verified: boolean
  picture: string
  position?: string

  constructor(partial: Partial<User>) {
    super(partial)
    Object.assign(this, partial)
  }
}
