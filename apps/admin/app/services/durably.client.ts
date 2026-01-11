import { createDurablyClient } from '@coji/durably-react/client'
import type { jobs } from './durably.server'

export const durablyClient = createDurablyClient<typeof jobs>({
  api: '/api/durably',
})
