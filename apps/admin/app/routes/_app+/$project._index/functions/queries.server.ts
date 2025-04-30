import { prisma } from '~/services/db.server'

export const getProject = async (projectId: string) => {
  const project = await prisma.project.findFirstOrThrow({
    where: { id: projectId },
  })
  return {
    ...project,
    excludes: JSON.parse(project.excludes) as string[],
  }
}

export const getProjectDetails = async (projectId: string) => {
  return await prisma.project.findFirstOrThrow({
    include: {
      files: {
        select: {
          id: true,
          path: true,
          content: true,
          contentMD5: true,
          output: true,
          isUpdated: true,
          translatedAt: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: [{ isUpdated: 'desc' }, { updatedAt: 'desc' }],
      },
    },
    where: { id: projectId },
  })
}

export const listProjectFiles = async (projectId: string) => {
  return await prisma.file.findMany({
    where: { projectId },
    orderBy: { path: 'asc' },
  })
}
