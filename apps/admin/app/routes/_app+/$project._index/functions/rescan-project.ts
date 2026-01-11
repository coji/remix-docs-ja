import { okAsync } from 'neverthrow'
import { db, now } from '~/services/db.server'
import { listRepositoryFiles } from '~/services/repository/list-repository-files'
import { getProjectPath } from '~/services/repository/utils'
import { getProject, listProjectFiles } from './queries.server'

export const rescanFiles = async (projectId: string) => {
  const project = await getProject(projectId)
  const projectFiles = await listProjectFiles(projectId)
  const directory = getProjectPath(project)
  const repositoryFiles = await listRepositoryFiles(directory, {
    pattern: project.pattern,
    excludes: project.excludes,
  })
  if (repositoryFiles.isErr()) {
    return repositoryFiles
  }

  const updatedFiles: {
    filePath: string
    content: string
    contentMD5: string
    status: 'updated' | 'added' | 'removed'
  }[] = []

  // check for updated and added files
  for (const repositoryFile of repositoryFiles.value) {
    const matchFile = projectFiles.find((projectFile) => {
      return projectFile.path === repositoryFile.filename
    })

    if (matchFile && matchFile.content_md5 !== repositoryFile.md5) {
      updatedFiles.push({
        filePath: repositoryFile.filename,
        content: repositoryFile.content,
        contentMD5: repositoryFile.md5,
        status: 'updated',
      })
    }
    if (!matchFile) {
      updatedFiles.push({
        filePath: repositoryFile.filename,
        content: repositoryFile.content,
        contentMD5: repositoryFile.md5,
        status: 'added',
      })
    }
  }

  // check for removed files
  for (const projectFile of projectFiles) {
    const matchFile = repositoryFiles.value.find((repositoryFile) => {
      return projectFile.path === repositoryFile.filename
    })

    if (!matchFile) {
      updatedFiles.push({
        filePath: projectFile.path,
        content: projectFile.content,
        contentMD5: projectFile.content_md5,
        status: 'removed',
      })
    }
  }

  // write back to database
  for (const updatedFile of updatedFiles) {
    if (updatedFile.status === 'updated') {
      await db
        .updateTable('files')
        .set({
          content: updatedFile.content,
          content_md5: updatedFile.contentMD5,
          is_updated: 1,
          updated_at: now(),
        })
        .where('path', '=', updatedFile.filePath)
        .where('project_id', '=', project.id)
        .execute()
    }
    if (updatedFile.status === 'added') {
      await db
        .insertInto('files')
        .values({
          path: updatedFile.filePath,
          content: updatedFile.content,
          content_md5: updatedFile.contentMD5,
          is_updated: 1,
          project_id: project.id,
          updated_at: now(),
          created_at: now(),
        })
        .execute()
    }
    if (updatedFile.status === 'removed') {
      await db
        .deleteFrom('files')
        .where('path', '=', updatedFile.filePath)
        .where('project_id', '=', project.id)
        .execute()
    }
  }

  return okAsync(updatedFiles)
}
