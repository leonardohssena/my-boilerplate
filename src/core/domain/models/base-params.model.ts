export interface PaginationParams {
  page: number
  limit: number
}

export type FilterParams<T> = {
  [K in keyof T]?: T[K] | { isPartial: boolean; value: T[K] } | { values: T[K][]; isList: boolean }
}

export type OrderByParams<T> = {
  [P in keyof T]?: 'asc' | 'desc'
}
