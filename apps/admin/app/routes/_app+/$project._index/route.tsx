import { zx } from '@coji/zodix/v4'
import { ArrowLeftIcon, LoaderCircleIcon } from 'lucide-react'
import { Form, href, Link, useNavigate, useNavigation } from 'react-router'
import { z } from 'zod'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HStack,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui'
import dayjs from '~/libs/dayjs'
import { durablyClient } from '~/services/durably.client'
import type { Route } from './+types/route'
import { exportFiles, getProjectDetails, rescanFiles } from './functions.server'

export const meta = ({ loaderData }: Route.MetaArgs) => [
  { title: `${loaderData?.project.id}` },
]

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { project: projectId } = zx.parseParams(params, { project: z.string() })
  const project = await getProjectDetails(projectId)
  return { project }
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { project: projectId } = zx.parseParams(params, { project: z.string() })
  const formData = await request.formData()

  const intent = formData.get('intent') as string

  if (intent === 'rescan-project') {
    const updatedFiles = await rescanFiles(projectId)
    if (updatedFiles.isErr()) {
      throw new Error(updatedFiles.error)
    }

    console.log({
      updated: updatedFiles.value
        .filter((file) => file.status === 'updated')
        .map((file) => file.filePath),
      added: updatedFiles.value
        .filter((file) => file.status === 'added')
        .map((file) => file.filePath),
      removed: updatedFiles.value
        .filter((file) => file.status === 'removed')
        .map((file) => file.filePath),
    })

    return {
      intent: 'rescan-project',
      rescan_result: updatedFiles.value,
    }
  }

  if (intent === 'export-files') {
    return {
      intent: 'export-files',
      export_result: await exportFiles(projectId),
    }
  }

  return {
    intent: 'unknown',
  }
}

export default function ProjectDetail({
  loaderData: { project },
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation()
  const navigate = useNavigate()

  const isSubmitting = navigation.state === 'submitting'
  const isRescanInProgress =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'rescan-project'
  const isExportInProgress =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'export-files'

  // Use durably for translation job
  const translationJob = durablyClient['translate-project'].useJob()

  const handleStartTranslation = () => {
    translationJob.trigger({ projectId: project.id })
  }

  const isTranslationRunning = translationJob.isRunning

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
          {project.id} <Badge variant="outline">Project</Badge>
        </CardTitle>
        <CardDescription>{project.description}</CardDescription>

        <Form method="POST">
          <HStack>
            <Button
              name="intent"
              value="rescan-project"
              disabled={isRescanInProgress}
            >
              {isRescanInProgress && (
                <LoaderCircleIcon size="16" className="mr-2 animate-spin" />
              )}
              Rescan files
            </Button>

            <Button
              type="button"
              onClick={handleStartTranslation}
              disabled={isSubmitting || isTranslationRunning}
            >
              {isTranslationRunning && (
                <LoaderCircleIcon size="16" className="mr-2 animate-spin" />
              )}
              Start Translation
            </Button>
            <Button name="intent" value="export-files" disabled={isSubmitting}>
              {isExportInProgress && (
                <LoaderCircleIcon size="16" className="mr-2 animate-spin" />
              )}
              Export files
            </Button>

            <div className="flex-1" />

            <HStack>
              <div>Sort by</div>
              <RadioGroup>
                <HStack>
                  <RadioGroupItem value="path" id="sort_path" />
                  <Label htmlFor="sort_path">Path</Label>
                </HStack>
                <HStack>
                  <RadioGroupItem value="content" id="sort_content" />
                  <Label htmlFor="sort_content">Content</Label>
                </HStack>
              </RadioGroup>
            </HStack>
          </HStack>
        </Form>

        {/* Translation Progress */}
        {translationJob.status && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                Translation: {translationJob.status}
                {translationJob.progress && (
                  <span className="ml-2 text-muted-foreground">
                    ({translationJob.progress.current}/
                    {translationJob.progress.total})
                  </span>
                )}
              </span>
              {translationJob.progress?.message && (
                <span className="text-muted-foreground">
                  {translationJob.progress.message}
                </span>
              )}
            </div>
            {translationJob.progress?.total && (
              <Progress
                value={
                  (translationJob.progress.current /
                    translationJob.progress.total) *
                  100
                }
              />
            )}
            {translationJob.output && (
              <div className="text-sm text-muted-foreground">
                Completed:{' '}
                {(translationJob.output as { translatedCount: number }).translatedCount}{' '}
                translated,{' '}
                {(translationJob.output as { errorCount: number }).errorCount} errors
              </div>
            )}
          </div>
        )}

        <div>
          {actionData?.intent === 'rescan-project' &&
            actionData.rescan_result && (
              <div>
                <div>Rescan completed</div>
                <div>
                  <div>
                    <div>Updated</div>
                    <ul>
                      {actionData.rescan_result
                        .filter((file) => file.status === 'updated')
                        .map((file) => (
                          <li className="ml-4" key={file.filePath}>
                            {file.filePath}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <div>Added</div>
                    <ul>
                      {actionData.rescan_result
                        .filter((file) => file.status === 'added')
                        .map((file) => (
                          <li className="ml-4" key={file.filePath}>
                            {file.filePath}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <div>Removed</div>
                    <ul>
                      {actionData.rescan_result
                        .filter((file) => file.status === 'removed')
                        .map((file) => (
                          <li className="ml-4" key={file.filePath}>
                            {file.filePath}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          {actionData?.intent === 'export-files' &&
            actionData.export_result && (
              <div>
                <div>Export completed</div>
                <div>
                  <ul>
                    {actionData.export_result.map((file) => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
        </div>
      </CardHeader>

      <CardContent>
        {project.files.length}件のファイル
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Path</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Translated</TableHead>
              <TableHead>UpdatedAt</TableHead>
              <TableHead>TranslatedAt</TableHead>
              <TableHead>isUpdated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.files.map((file) => (
              <TableRow
                key={file.path}
                className="hover:cursor-pointer"
                onClick={() => {
                  navigate(
                    href('/:project/:file', {
                      project: project.id,
                      file: String(file.id),
                    }),
                  )
                }}
              >
                <TableCell>{file.path}</TableCell>
                <TableCell>
                  <div className="mr-2 text-right">
                    {file.content.length.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="mr-2 text-right">
                    {file.output?.length.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  {dayjs(file.updatedAt)
                    .utc()
                    .tz()
                    .format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell>
                  {file.translatedAt &&
                    dayjs(file.translatedAt)
                      .utc()
                      .tz()
                      .format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell>
                  {file.isUpdated && <Badge>Updated</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
