import { db } from '~/services/db.server'

export const getProject = async (projectId: string) => {
  const project = await db
    .selectFrom('projects')
    .selectAll()
    .where('id', '=', projectId)
    .executeTakeFirstOrThrow()
  return {
    ...project,
    excludes: JSON.parse(project.excludes) as string[],
  }
}

export const getProjectDetails = async (projectId: string) => {
  const project = await db
    .selectFrom('projects')
    .selectAll()
    .where('id', '=', projectId)
    .executeTakeFirstOrThrow()

  const files = await db
    .selectFrom('files')
    .select([
      'id',
      'path',
      'content',
      'content_md5 as contentMD5',
      'output',
      'is_updated as isUpdated',
      'translated_at as translatedAt',
      'updated_at as updatedAt',
      'created_at as createdAt',
    ])
    .where('project_id', '=', projectId)
    .orderBy('is_updated', 'desc')
    .orderBy('updated_at', 'desc')
    .execute()

  return {
    ...project,
    files: files.map((f) => ({
      ...f,
      isUpdated: Boolean(f.isUpdated),
    })),
  }
}

export const listProjectFiles = async (projectId: string) => {
  return await db
    .selectFrom('files')
    .selectAll()
    .where('project_id', '=', projectId)
    .orderBy('path', 'asc')
    .execute()
}
