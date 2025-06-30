/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongodb'

import { FilterParams, OrderByParams, PaginationParams } from '@domain/models/base-params.model'
import { IBaseRepository } from '@domain/repositories/base.protocol'

export abstract class InMemoryBaseRepository<T extends { id: string }> implements IBaseRepository<T> {
  public items: T[] = []

  clear() {
    this.items = []
  }

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
    let results = [...this.items]

    if (Object.keys(where).length > 0) {
      results = results.filter(item =>
        Object.entries(where).every(([key, value]) => {
          if (typeof value === 'object' && value !== null && 'contains' in value) {
            return item[key].includes(value.contains)
          }
          if (typeof value === 'object' && value !== null && 'in' in value) {
            return value.in.includes(item[key])
          }
          return item[key] === value
        }),
      )
    }

    const orderKeys = Object.keys(orderBy)
    if (orderKeys.length > 0) {
      results.sort((a, b) => {
        for (const key of orderKeys) {
          const direction = orderBy[key]
          if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
          if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    const start = (pagination.page - 1) * pagination.limit
    const end = start + pagination.limit

    return results.slice(start, end)
  }

  async findOne(data: Partial<T>): Promise<T | null> {
    const item = this.items.find(item => Object.entries(data).every(([key, value]) => item[key] === value))
    return item
  }

  async findById(id: string): Promise<T | null> {
    const item = this.items.find(item => item.id === id)
    return item
  }

  async create(data: Partial<T>): Promise<T> {
    if (!data.id) {
      data.id = new ObjectId().toString()
    }
    const item = data as T
    this.items.push(item)
    return item
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    if (data.id) delete data.id
    const index = this.items.findIndex(item => item.id === id)
    this.items[index] = { ...this.items[index], ...data }
    return this.items[index]
  }

  async softDelete(id: string, userId: string): Promise<T> {
    const index = this.items.findIndex(item => item.id === id)
    this.items[index] = { ...this.items[index], deleted: true, deletedBy: { id: userId, deletedAt: new Date() } }
    return this.items[index]
  }

  async delete(id: string): Promise<T> {
    const index = this.items.findIndex(item => item.id === id)
    const [deleted] = this.items.splice(index, 1)
    return deleted
  }
}
