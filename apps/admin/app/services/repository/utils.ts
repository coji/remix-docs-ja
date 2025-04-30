import type { Project } from '@prisma/client'
import path from 'node:path'

export const getProjectPath = (project: Pick<Project, 'id' | 'path'>) => {
  return path.join('projects', project.id, project.path)
}
