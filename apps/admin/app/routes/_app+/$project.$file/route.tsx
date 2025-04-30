import { ArrowLeftIcon } from 'lucide-react'
import { basename } from 'node:path'
import { Link, Outlet } from 'react-router'
import { z } from 'zod'
import { zx } from 'zodix'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  NavTab,
  NavTabs,
} from '~/components/ui'
import type { Route } from './+types/route'
import { getFile, getProject } from './queries.server'

export const meta = ({ data }: Route.MetaArgs) => [
  { title: `${data?.filename} - ${data?.project.id}` },
]

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { project: projectId, file: fileId } = zx.parseParams(params, {
    project: z.string(),
    file: zx.NumAsString,
  })
  const project = await getProject(projectId)
  const file = await getFile(projectId, fileId)
  return { project, file, filename: basename(file.path) }
}

export default function ProjectFileDetails({
  loaderData: { project, file },
}: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mr-2 rounded-full"
            asChild
          >
            <Link to=".." relative="path">
              <ArrowLeftIcon size="16" />
            </Link>
          </Button>
          {file.path} <Badge variant="outline">File</Badge>
        </CardTitle>

        <NavTabs>
          <NavTab to="." end>
            Edit
          </NavTab>
          <NavTab to="./translate" end>
            Translate
          </NavTab>
          <NavTab to="./chunks" end>
            Chunks
          </NavTab>
        </NavTabs>
      </CardHeader>

      <CardContent>
        <Outlet context={{ project, file }} />
      </CardContent>
    </Card>
  )
}
