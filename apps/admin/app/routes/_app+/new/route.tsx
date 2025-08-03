import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { Form, href, Link, redirect } from 'react-router'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '~/components/ui'
import { Stack } from '~/components/ui/stack'
import { listRepositoryFiles } from '~/services/repository/list-repository-files'
import { getProjectPath } from '~/services/repository/utils'
import type { Route } from './+types/route'
import { createFiles, createProject } from './functions/mutations.server'

const schema = z.object({
  id: z.string(),
  path: z.string(),
  pattern: z.string(),
  excludes: z.string().optional(),
  description: z.string().optional(),
  prompt: z.string(),
})

export const action = async ({ request }: Route.ActionArgs) => {
  const submission = parseWithZod(await request.formData(), { schema })
  if (submission.status !== 'success') {
    return { lastResult: submission.reply() }
  }

  const project = await createProject(submission.value)
  const files = await listRepositoryFiles(getProjectPath(project), {
    pattern: project.pattern,
    excludes: project.excludes,
  })
  if (files.isErr()) {
    throw files.error
  }

  await createFiles(project.id, files.value)

  throw redirect(href('/'))
}

export default function NewProjectPage({ actionData }: Route.ComponentProps) {
  const [form, { id, path, pattern, excludes, description, prompt }] = useForm({
    lastResult: actionData?.lastResult,
    defaultValue: {
      prompt:
        'Translate the following text to Japanese. Markdowns should be left intact:',
    },
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })

  return (
    <Form method="post" {...getFormProps(form)}>
      <Card>
        <CardHeader>
          <CardTitle>New Project</CardTitle>
          <CardDescription>Create a new translation project</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack>
            <div>
              <Label htmlFor={id.id}>Name</Label>
              <Input {...getInputProps(id, { type: 'text' })} />
              <div id={id.errorId} className="text-destructive text-sm">
                {id.errors}
              </div>
            </div>
            <div>
              <Label htmlFor={path.id}>Document Path</Label>
              <Input {...getInputProps(path, { type: 'text' })} />
              <div id={path.errorId} className="text-destructive text-sm">
                {path.errors}
              </div>
            </div>
            <div>
              <Label htmlFor={pattern.id}>Glob Pattern</Label>
              <Input {...getInputProps(pattern, { type: 'text' })} />
              <div id={pattern.errorId} className="text-destructive text-sm">
                {pattern.errors}
              </div>
            </div>

            <div>
              <Label htmlFor={excludes.id}>Excludes</Label>
              <Input {...getInputProps(excludes, { type: 'text' })} />
              <div id={excludes.errorId} className="text-destructive text-sm">
                {excludes.errors}
              </div>
            </div>

            <div>
              <Label htmlFor={description.id}>Description</Label>
              <Textarea {...getTextareaProps(description)} />
              <div
                id={description.errorId}
                className="text-destructive text-sm"
              >
                {description.errors}
              </div>
            </div>

            <div>
              <Label htmlFor={prompt.id}>Prompt</Label>
              <Textarea {...getTextareaProps(prompt)} />
              <div id={prompt.errorId} className="text-destructive text-sm">
                {prompt.errors}
              </div>
            </div>
          </Stack>
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row">
          <Button type="button" variant="ghost" asChild>
            <Link to={href('/')}>Cancel</Link>
          </Button>

          <Button type="submit">Create Project</Button>
        </CardFooter>
      </Card>
    </Form>
  )
}
