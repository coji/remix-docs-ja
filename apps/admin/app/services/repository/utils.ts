import path from 'node:path'
import type { Project } from '~/generated/prisma'

export const getProjectPath = (project: Pick<Project, 'id' | 'path'>) => {
  return path.join('projects', project.id, project.path)
}
