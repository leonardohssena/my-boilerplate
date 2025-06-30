import { Auth0UserDto } from '@application/services/auth0/dto'
import User from '@domain/models/users.model'
import { UserDTO } from '@interfaces/dtos/users'

export const USER_ID = 'auth0|66d47bb57724f24a97972fa9'

export const AUTH0_USER_OBJECT = new Auth0UserDto({
  created_at: new Date().toISOString(),
  email: 'test@example.com',
  email_verified: false,
  identities: [
    {
      connection: 'Username-Password-Authentication',
      user_id: '66d47bb57724f24a97972fa9',
      provider: 'auth0',
      isSocial: false,
    },
  ],
  name: 'test',
  nickname: 'test',
  picture:
    'https://s.gravatar.com/avatar/93942e96f5acd83e2e047ad8fe03114d?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fte.png',
  updated_at: new Date().toISOString(),
  user_id: 'auth0|66d47bb57724f24a97972fa9',
  user_metadata: {
    position: 'test',
  },
  username: 'test',
})

export const USER_OBJECT = new User({
  id: AUTH0_USER_OBJECT.user_id,
  name: AUTH0_USER_OBJECT.name,
  nickname: AUTH0_USER_OBJECT.nickname,
  email: AUTH0_USER_OBJECT.email,
  email_verified: AUTH0_USER_OBJECT.email_verified,
  picture: AUTH0_USER_OBJECT.picture,
  position: AUTH0_USER_OBJECT.user_metadata?.position as string,
  createdAt: new Date(AUTH0_USER_OBJECT.created_at),
  updatedAt: new Date(AUTH0_USER_OBJECT.updated_at),
})

export const USER_DTO_OBJECT = UserDTO.toViewModel(USER_OBJECT)
