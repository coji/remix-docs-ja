import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import fs from 'node:fs/promises'
import path from 'node:path'
import { processMarkdown } from '~/services/md.server'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const filename = params['*'] ?? 'index'
  const filepath = path.join('./docs', `${filename}.md`)
  const doc = await fs.readFile(filepath, 'utf-8')
  return { doc: await processMarkdown(doc) }
}

export default function Docs() {
  const { doc } = useLoaderData<typeof loader>()
  return (
    <div
      className="prose mx-4 my-2 dark:prose-invert"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{
        __html: doc.html,
      }}
    />
  )
}
