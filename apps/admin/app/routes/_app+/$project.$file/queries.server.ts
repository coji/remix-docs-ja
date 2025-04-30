import { prisma } from '~/services/db.server'

export const getProject = async (projectId: string) => {
  return await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
  })
}

export const getFile = async (projectId: string, fileId: number) => {
  return await prisma.file.findUniqueOrThrow({
    where: {
      id: fileId,
      projectId,
    },
  })
}
