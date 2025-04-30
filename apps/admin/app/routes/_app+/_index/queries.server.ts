import { prisma } from '~/services/db.server'

export const listProjects = async () => {
  return await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  })
}
