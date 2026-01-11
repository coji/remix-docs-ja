import { db } from '~/services/db.server'

export const listProjects = async () => {
  return await db
    .selectFrom('projects')
    .selectAll()
    .orderBy('created_at', 'desc')
    .execute()
}
