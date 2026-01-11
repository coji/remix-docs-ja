import { db } from '~/services/db.server'

export const getProject = async (projectId: string) => {
  return await db
    .selectFrom('projects')
    .selectAll()
    .where('id', '=', projectId)
    .executeTakeFirstOrThrow()
}

export const getFile = async (projectId: string, fileId: number) => {
  return await db
    .selectFrom('files')
    .selectAll()
    .where('id', '=', fileId)
    .where('project_id', '=', projectId)
    .executeTakeFirstOrThrow()
}
