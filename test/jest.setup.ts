import { PrismaClient } from '@prisma/client'
import { MongoMemoryReplSet } from 'mongodb-memory-server'

import './load-env'

export default async function globalSetup() {
  console.log('Starting setup...')
  const prisma = new PrismaClient()

  const mongod = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  })

  process.env.DATABASE_URL = mongod.getUri('tests')

  global.__MONGOD__ = mongod
  global.__PRISMA__ = prisma

  console.log('Setup finished...')
}
