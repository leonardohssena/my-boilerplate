export abstract class BaseModel {
  id: string
  isActive: boolean
  deleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedBy?: {
    id: string
    deletedAt: Date
  }

  constructor(partial: Partial<BaseModel>) {
    Object.assign(this, partial)
  }
}
