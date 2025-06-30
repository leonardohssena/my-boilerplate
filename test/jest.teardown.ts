export default async function globalTeardown() {
  console.log('Tearing down tests...')
  await global.__PRISMA__.$disconnect()
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop()
  }
  console.log('Tearing down tests stopped...')
}
