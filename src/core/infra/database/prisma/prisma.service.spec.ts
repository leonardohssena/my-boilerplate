import { Test } from '@nestjs/testing'

import { PrismaService } from '@infra/database/prisma/prisma.service'

describe('PrismaService', () => {
  let service: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile()

    service = moduleRef.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should connect on init', async () => {
    const spy = jest.spyOn(service, '$connect')
    await service.onModuleInit()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should disconnect on destroy', async () => {
    const spy = jest.spyOn(service, '$disconnect')
    await service.onModuleDestroy()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
