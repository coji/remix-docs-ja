import type { Prisma, Project } from '~/generated/prisma'
import { prisma } from '~/services/db.server'
import type { RepositoryFile } from '~/services/repository/types'

export const createProject = async (data: Prisma.ProjectCreateInput) => {
  const project = await prisma.project.create({
    data: {
      ...data,
      excludes: data.excludes ? `[${JSON.stringify(data.excludes)}]` : '[]',
    },
  })
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
    await prisma.file.create({
      data: {
        path: file.filename,
        content: file.content,
        contentMD5: file.md5,
        Project: { connect: { id: projectId } },
      },
    })
  }
}
