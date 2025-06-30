/* eslint-disable @typescript-eslint/no-explicit-any */

import { FilterParams, OrderByParams, PaginationParams } from '@domain/models/base-params.model'

import { IBaseRepository } from './base.protocol'

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected constructor(
    protected readonly model: { findMany: any; findFirst: any; findUnique: any; create: any; update: any; delete: any },
  ) {}

  private parseFilters(filters: FilterParams<T>) {
    const where: Record<string, any> = {}
    Object.entries(filters).forEach(
      ([key, value]: [string, T[keyof T] | { isPartial: boolean; value: T[keyof T] }]) => {
        if (typeof value === 'object' && value !== null && 'isPartial' in value && (value as any).isPartial) {
          where[key] = {
            contains: (value as any).value,
          }
        } else if (typeof value === 'object' && value !== null && 'isList' in value && (value as any).isList) {
          where[key] = {
            in: (value as any).values,
          }
        } else {
          where[key] = value
        }
      },
    )

    return where
  }

  async findMany(pagination: PaginationParams, filters: FilterParams<T>, orderBy: OrderByParams<T>): Promise<T[]> {
    const where = this.parseFilters(filters)
    return this.model.findMany({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      where,
      orderBy,
    })
  }

  async findOne(data: Partial<T>): Promise<T | null> {
    return this.model.findFirst({ where: data })
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
    })
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create({ data })
  }

  async update(id: string, data: Partial<T> & { id: string }): Promise<T> {
    if (data.id) delete data.id
    return this.model.update({
      where: { id },
      data,
    })
  }

  async softDelete(id: string, userId: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: {
        deleted: true,
        deletedBy: {
          id: userId,
          deletedAt: new Date(),
        },
      },
    })
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } })
  }
}
