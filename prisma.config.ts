import { config as loadEnv } from 'dotenv'
import { defineConfig } from '@prisma/config'

// Prisma 7 no longer auto-loads .env files, and this project keeps its secrets in
// .env.local (gitignored, the same file Next.js reads). Load it explicitly so CLI
// commands like `prisma studio` work without the setup script exporting DATABASE_URL.
loadEnv({ path: '.env.local', quiet: true })
loadEnv({ quiet: true }) // .env fallback, if one exists

// The datasource URL lives here (not in schema.prisma, where Prisma 7 removed it) and
// is used by the CLI for migrate/introspect/seed. The application itself connects
// through a driver adapter — see src/lib/server/db.ts.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    // tsx (rather than node --experimental-strip-types) because the seed pulls in the
    // app's own modules, which use extensionless imports and the "@/" path alias.
    seed: 'npx tsx prisma/seed.ts',
  },
})
