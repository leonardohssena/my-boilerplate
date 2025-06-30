import { SetMetadata } from '@nestjs/common'

export const FIELD_KEY = 'field'

export type FieldRolesKeys = 'manager' | 'viewer'

export const FieldRoles: Record<string, FieldRolesKeys[]> = {
  MANAGER: ['manager'],
  VIEWER: ['manager', 'viewer'],
}

export interface FieldType {
  location: 'body' | 'query' | 'params' | 'headers'
  field: string
  roles: FieldRolesKeys[]
}

export const Fields = (location: FieldType['location'], field: FieldType['field'], roles: FieldType['roles']) =>
  SetMetadata(FIELD_KEY, { location, field, roles })
