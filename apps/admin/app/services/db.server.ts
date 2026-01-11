import Database from 'better-sqlite3'
import createDebug from 'debug'
import { Kysely, SqliteDialect } from 'kysely'
import type { Database as DatabaseSchema } from './db.types'

const debug = createDebug('app:db')

const dialect = new SqliteDialect({
  database: new Database(
    process.env.DATABASE_URL?.replace('file:', '') ?? 'db/dev.db',
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
