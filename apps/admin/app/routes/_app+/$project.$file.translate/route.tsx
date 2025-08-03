import { getFormProps, getTextareaProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { LoaderCircleIcon } from 'lucide-react'
import { data, Form, useNavigation, useOutletContext } from 'react-router'
import { dataWithSuccess } from 'remix-toast'
import { z } from 'zod'
import { zx } from 'zodix'
import { Button, Label, Stack, Textarea } from '~/components/ui'
import type { File, Project } from '~/generated/prisma'
import { translateByGemini } from '~/services/translate-gemini'
import type { Route } from './+types/route'
import { updateFileOutput } from './mutations.server'
import { getFile } from './queries.server'

const schema = z.object({
  original: z.string(),
  prompt: z.string(),
})

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { project: projectId, file: fileId } = zx.parseParams(params, {
    project: z.string(),
    file: zx.NumAsString,
  })

  const submission = parseWithZod(await request.formData(), { schema })
  if (submission.status !== 'success') {
    return data({ lastResult: submission.reply() })
  }

  const file = await getFile(projectId, fileId)
  const ret = await translateByGemini({
    extraPrompt: submission.value.prompt,
    source: file.content,
    prevTranslatedText: file.output ?? undefined,
  })

  if (ret.type === 'error') {
    return {
      lastResult: submission.reply({
        resetForm: true,
        formErrors: [ret.error],
      }),
    }
  }

  await updateFileOutput(projectId, fileId, ret.translatedText)

  return dataWithSuccess(
    {
      lastResult: submission.reply({ resetForm: true }),
    },
    {
      message: 'Translation successful',
    },
  )
}

export default function ProjectFileDetails({
  actionData,
}: Route.ComponentProps) {
  const { project, file } = useOutletContext<{ project: Project; file: File }>()
  const navigation = useNavigation()
  const [form, { prompt }] = useForm({
    lastResult: navigation.state === 'idle' ? actionData?.lastResult : null,
    defaultValue: {
      prompt: project.prompt,
    },
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })

  return (
    <div>
      <Form
        method="POST"
        {...getFormProps(form)}
        className="grid grid-cols-2 gap-2"
      >
        <Stack>
          <Label htmlFor="original">Original</Label>
          <Textarea
            id="original"
            name="original"
            readOnly
            rows={15}
            value={file.content}
          />
        </Stack>
        <Stack>
          <Label htmlFor="output">Output</Label>
          <Textarea
            id="output"
            readOnly
            value={file.output ?? undefined}
            rows={15}
          />
        </Stack>

        <Stack className="col-span-2">
          <Stack>
            <Label>Extra Prompt</Label>
            <Textarea {...getTextareaProps(prompt)} />
          </Stack>

          <Button
            type="submit"
            className="w-full"
            disabled={navigation.state === 'submitting'}
          >
            {navigation.state === 'submitting' && (
              <LoaderCircleIcon size="16" className="mr-2 animate-spin" />
            )}
            Translate
          </Button>
        </Stack>
      </Form>
    </div>
  )
}
