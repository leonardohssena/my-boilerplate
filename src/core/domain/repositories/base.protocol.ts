import { Injectable } from '@nestjs/common'

import { FilterParams, OrderByParams, PaginationParams } from '@domain/models/base-params.model'

@Injectable()
export abstract class IBaseRepository<T> {
  abstract findMany(pagination: PaginationParams, filters: FilterParams<T>, orderBy: OrderByParams<T>): Promise<T[]>
  abstract findOne(data: Partial<T>): Promise<T | null>
  abstract findById(id: string): Promise<T | null>
  abstract create(data: Partial<T>): Promise<T>
  abstract update(id: string, data: Partial<T>): Promise<T>
  abstract softDelete(id: string, userId: string): Promise<T>
  abstract delete(id: string): Promise<T>
}
