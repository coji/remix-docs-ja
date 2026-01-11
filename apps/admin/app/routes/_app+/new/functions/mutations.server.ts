import { db, now } from '~/services/db.server'
import type { NewProject, Project } from '~/services/db.types'
import type { RepositoryFile } from '~/services/repository/types'

export const createProject = async (
  data: Omit<NewProject, 'updated_at' | 'created_at' | 'excludes'> & {
    excludes?: string
  },
) => {
  const project = await db
    .insertInto('projects')
    .values({
      ...data,
      excludes: JSON.stringify(data.excludes ? [data.excludes] : []),
      updated_at: now(),
      created_at: now(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return {
    ...project,
    excludes: JSON.parse(project.excludes) as string[],
  }
}

export const createFiles = async (
  projectId: Project['id'],
  files: RepositoryFile[],
) => {
  for (const file of files) {
    await db
      .insertInto('files')
      .values({
        project_id: projectId,
        path: file.filename,
        content: file.content,
        content_md5: file.md5,
        updated_at: now(),
        created_at: now(),
      })
      .execute()
  }
}
