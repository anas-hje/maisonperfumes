import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Reuse one client across hot reloads in development; Next's dev server re-evaluates
// modules on every change, and a fresh PrismaClient each time exhausts the connection
// pool after a handful of edits.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Run ./scripts/db-setup.sh to start Postgres and link the app to it.'
    )
  }

  // Prisma 7 connects through a driver adapter rather than a URL in schema.prisma.
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }

  return client
}

// Constructed on first property access rather than at import time. `next build`
// imports every route module to collect its configuration, so an eager client would
// make a missing DATABASE_URL fail the build — even though nothing queries during it.
// Building and serving can then use different environments, and the error still
// surfaces (with the message above) on the first real request.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = globalForPrisma.prisma ?? createClient()
    return Reflect.get(client, property, receiver)
  },
})
