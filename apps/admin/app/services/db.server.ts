import { PrismaClient } from '~/generated/prisma'
import createDebug from 'debug'

const debug = createDebug('app:db')

export const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
})

prisma.$on('query', (e) => {
  debug(`${e.query}, ${e.params}, ${e.duration}ms`)
})
