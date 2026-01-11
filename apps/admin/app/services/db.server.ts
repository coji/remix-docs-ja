import Database from 'better-sqlite3'
import createDebug from 'debug'
import { Kysely, SqliteDialect } from 'kysely'
import type { Database as DatabaseSchema } from './db.types'

const debug = createDebug('app:db')

const DEFAULT_DB_PATH = 'data/dev.db'

const parseDbPath = (url: string): string => {
  // Supports: sqlite:// (Atlas), file: (Prisma), or plain paths
  return url.replace(/^sqlite:\/\//, '').replace(/^file:/, '')
}

export const dialect = new SqliteDialect({
  database: new Database(
    parseDbPath(process.env.DATABASE_URL ?? DEFAULT_DB_PATH),
  ),
})

export const db = new Kysely<DatabaseSchema>({
  dialect,
  log: (event) => {
    if (event.level === 'query') {
      debug(
        `${event.query.sql}, ${JSON.stringify(event.query.parameters)}, ${event.queryDurationMillis}ms`,
      )
    }
  },
})

// Helper function to get current datetime in ISO format
export const now = () => new Date().toISOString()
