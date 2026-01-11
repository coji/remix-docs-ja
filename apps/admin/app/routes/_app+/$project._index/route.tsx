import { useJob, useRuns } from '@coji/durably-react/client'
import { zx } from '@coji/zodix/v4'
import { ArrowLeftIcon, HistoryIcon, LoaderCircleIcon } from 'lucide-react'
import { useState } from 'react'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui'
import dayjs from '~/libs/dayjs'
import type { Route } from './+types/route'
import { exportFiles, getProjectDetails, rescanFiles } from './functions.server'

// Type definitions for durably job data
type TranslationJobOutput = {
  translatedCount: number
  errorCount: number
  totalCount: number
  errors: { path: string; error: string }[]
}

type JobProgress = {
  current: number
  total: number
  message?: string
}

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

  // Job history
  const [historyOpen, setHistoryOpen] = useState(false)
  const { runs } = useRuns({
    api: '/api/durably',
    jobName: 'translate-project',
    pageSize: 20,
  })

  // Find the latest running job to follow
  const latestRunningJob = runs?.find(
    (run) => run.status === 'running' || run.status === 'pending',
  )

  // Use durably for translation job
  const translationJob = useJob({
    api: '/api/durably',
    jobName: 'translate-project',
    initialRunId: latestRunningJob?.id,
  })

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

            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline">
                  <HistoryIcon size="16" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent className="w-125 sm:max-w-125">
                <SheetHeader>
                  <SheetTitle>Translation History</SheetTitle>
                  <SheetDescription>Past translation job runs</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  {runs?.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              run.status === 'completed'
                                ? 'default'
                                : run.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {run.status === 'running' && (
                              <LoaderCircleIcon
                                size="12"
                                className="mr-1 animate-spin"
                              />
                            )}
                            {run.status}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {run.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {dayjs(run.createdAt)
                            .utc()
                            .tz()
                            .format('YYYY-MM-DD HH:mm:ss')}
                        </div>
                        {/* Progress for running jobs */}
                        {(run.status === 'running' ||
                          run.status === 'pending') &&
                          run.progress &&
                          (() => {
                            const progress = run.progress as JobProgress
                            return (
                              <div className="w-full space-y-1">
                                <div className="text-xs">
                                  {progress.current ?? 0}/{progress.total ?? 0}
                                </div>
                                <Progress
                                  value={
                                    ((progress.current ?? 0) /
                                      (progress.total ?? 1)) *
                                    100
                                  }
                                  className="h-1.5"
                                />
                              </div>
                            )
                          })()}
                        {/* Output for completed jobs */}
                        {run.output &&
                          (() => {
                            const output = run.output as TranslationJobOutput
                            return (
                              <div className="text-xs">
                                {output.translatedCount ?? 0} translated,{' '}
                                {(output.errorCount ?? 0) > 0 ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-destructive cursor-help underline">
                                          {output.errorCount ?? 0} errors
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="bottom"
                                        className="max-w-100"
                                      >
                                        <ul className="space-y-1">
                                          {(output.errors ?? []).map((e, i) => (
                                            <li key={i} className="text-xs">
                                              <span className="font-medium">
                                                {e.path}
                                              </span>
                                              : {e.error}
                                            </li>
                                          ))}
                                        </ul>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span>0 errors</span>
                                )}
                              </div>
                            )
                          })()}
                        {/* Error for failed jobs */}
                        {run.status === 'failed' && run.error && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-destructive max-w-80 cursor-help truncate text-xs">
                                  {String(run.error)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="max-w-100 whitespace-pre-wrap"
                              >
                                {String(run.error)}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!runs || runs.length === 0) && (
                    <div className="text-muted-foreground py-8 text-center text-sm">
                      No translation history yet
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

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
                  <span className="text-muted-foreground ml-2">
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
            {translationJob.output &&
              (() => {
                const output = translationJob.output as TranslationJobOutput
                return (
                  <div className="text-muted-foreground text-sm">
                    Completed: {output.translatedCount} translated,{' '}
                    {output.errorCount} errors
                  </div>
                )
              })()}
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
