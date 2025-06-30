import removeSpaces from '@shared/helpers/string-remove-spaces.helper'

import { BaseModel } from './base.model'

export default class Account extends BaseModel {
  name: string
  nickname: string
  picture?: string

  constructor(partial: Partial<Account>) {
    if (partial.nickname) partial.nickname = removeSpaces(partial.nickname.toLowerCase())
    super(partial)
    Object.assign(this, partial)
  }
}
